// tests/commentController.test.js
import { jest } from '@jest/globals';

// ---------- Mock modules ก่อน import SUT ----------
const CommentMock = {};
const ImageMock = {};

// chain helper: Comment.find({}).populate(...).sort(...)
const makeFindPopulateSort = (valueToResolve) => ({
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockResolvedValue(valueToResolve),
});

// mock comment & image models
await jest.unstable_mockModule('../models/comment.js', () => ({
  __esModule: true,
  default: CommentMock,
}));
await jest.unstable_mockModule('../models/Image.js', () => ({
  __esModule: true,
  default: ImageMock,
}));

// import ของจริง (หลัง mock แล้ว)
const { default: Comment } = await import('../models/comment.js');
const { default: Image } = await import('../models/Image.js');
const { default: commentController } = await import('../controllers/commentController.js');

// ---------- helpers ----------
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  res.send   = jest.fn().mockReturnValue(res);
  return res;
};
const mockReq = (overrides = {}) => ({
  params: {},
  body: {},
  user: { id: 'u1', name: 'Alice' },
  ...overrides,
});

// สร้าง image document mock
const makeImageDoc = (over = {}) => ({
  _id: 'img1',
  comments: [],
  save: jest.fn().mockResolvedValue(),
  ...over,
});

// สร้าง comment document mock
const makeCommentDoc = (over = {}) => ({
  _id: 'c1',
  userId: 'u1',
  imageId: 'img1',
  text: 'hello',
  save: jest.fn().mockResolvedValue(),
  ...over,
});

// ---------- tests ----------
beforeEach(() => {
  jest.clearAllMocks();
});

describe('commentController.addComment', () => {
  test('400 เมื่อข้อความว่าง/มีแต่ช่องว่าง', async () => {
    const req = mockReq({ params: { imageId: 'img1' }, body: { text: '   ' } });
    const res = mockRes();

    await commentController.addComment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Comment can't be empty" });
  });

  test('404 เมื่อไม่พบรูป', async () => {
    const req = mockReq({ params: { imageId: 'img404' }, body: { text: 'ok' } });
    const res = mockRes();

    Image.findById = jest.fn().mockResolvedValue(null);

    await commentController.addComment(req, res);

    expect(Image.findById).toHaveBeenCalledWith('img404');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "NO IMGAGE" });
  });

  test('200 เมื่อสร้างคอมเมนต์สำเร็จ และ push เข้า image.comments', async () => {
    const req = mockReq({ params: { imageId: 'img1' }, body: { text: '  nice post  ' } });
    const res = mockRes();

    const imageDoc = makeImageDoc();
    Image.findById = jest.fn().mockResolvedValue(imageDoc);

    const created = makeCommentDoc({ _id: 'c999', text: 'nice post' });
    Comment.create = jest.fn().mockResolvedValue(created);

    await commentController.addComment(req, res);

    expect(Comment.create).toHaveBeenCalledWith({
      userId: 'u1',
      imageId: 'img1',
      text: 'nice post',
    });
    expect(imageDoc.comments).toContain('c999');
    expect(imageDoc.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true, comment: created });
  });
});

describe('commentController.getAllCommentByID', () => {
  test('200 และคืน comments ที่ populate แล้ว', async () => {
    const req = mockReq({ params: { imageId: 'img1' } });
    const res = mockRes();

    const rows = [
      makeCommentDoc({ _id: 'c2', userId: { _id: 'u2', name: 'Bob' }, createdAt: new Date() }),
      makeCommentDoc({ _id: 'c1', userId: { _id: 'u1', name: 'Alice' }, createdAt: new Date() }),
    ];
    Comment.find = jest.fn(() => makeFindPopulateSort(rows));

    await commentController.getAllCommentByID(req, res);

    expect(Comment.find).toHaveBeenCalledWith({ imageId: 'img1' });
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.ok).toBe(true);
    expect(Array.isArray(payload.comments)).toBe(true);
    expect(payload.comments).toHaveLength(2);
    expect(payload.comments.map(c => c._id)).toEqual(['c2', 'c1']);
  });
});

describe('commentController.updateComment', () => {
  test('400 เมื่อข้อความว่าง', async () => {
    const req = mockReq({ params: { commentID: 'c1' }, body: { text: '  ' } });
    const res = mockRes();

    await commentController.updateComment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Comment can't be empty" });
  });

  test('403 เมื่อไม่ใช่เจ้าของคอมเมนต์', async () => {
    const req = mockReq({ params: { commentID: 'c1' }, user: { id: 'uA' } , body: { text: 'edit' } });
    const res = mockRes();

    const commentDoc = makeCommentDoc({ userId: 'uB' });
    Comment.findById = jest.fn().mockResolvedValue(commentDoc);

    await commentController.updateComment(req, res);

    expect(Comment.findById).toHaveBeenCalledWith('c1');
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'forbidden' });
  });

  // NOTE: โค้ดปัจจุบันตรวจสอบ forbidden ก่อนเช็ค !comment — ถ้าไม่พบคอมเมนต์จริง ๆ จะ throw และเข้า catch เป็น 500
  test('500 เมื่อไม่พบคอมเมนต์ (ตามพฤติกรรมโค้ดปัจจุบัน)', async () => {
    const req = mockReq({ params: { commentID: 'c404' }, body: { text: 'edit' } });
    const res = mockRes();

    Comment.findById = jest.fn().mockResolvedValue(null);

    await commentController.updateComment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Fail to update comment' });
  });

  test('200 เมื่ออัปเดตสำเร็จ', async () => {
    const req = mockReq({ params: { commentID: 'c1' }, user: { id: 'u1' }, body: { text: '  updated text  ' } });
    const res = mockRes();

    const commentDoc = makeCommentDoc({ userId: 'u1', text: 'old' });
    Comment.findById = jest.fn().mockResolvedValue(commentDoc);

    await commentController.updateComment(req, res);

    expect(commentDoc.text).toBe('updated text');
    expect(commentDoc.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      ok: true,
      message: 'Comment updated',
      comment: commentDoc,
    }));
  });
});

describe('commentController.deleteCommentByID', () => {
  test('404 เมื่อไม่พบคอมเมนต์', async () => {
    const req = mockReq({ params: { commentID: 'c404' } });
    const res = mockRes();

    Comment.findById = jest.fn().mockResolvedValue(null);

    await commentController.deleteCommentByID(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Comment not found' });
  });

  test('403 เมื่อไม่ใช่เจ้าของคอมเมนต์', async () => {
    const req = mockReq({ params: { commentID: 'c1' }, user: { id: 'uA' } });
    const res = mockRes();

    const commentDoc = makeCommentDoc({ userId: 'uB' });
    Comment.findById = jest.fn().mockResolvedValue(commentDoc);

    await commentController.deleteCommentByID(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'forbidden' });
  });

  test('200 เมื่อลบสำเร็จ และ pull จาก Image.comments', async () => {
    const req = mockReq({ params: { commentID: 'c1' }, user: { id: 'u1' } });
    const res = mockRes();

    const commentDoc = makeCommentDoc({ _id: 'c1', userId: 'u1', imageId: 'img1' });
    Comment.findById = jest.fn().mockResolvedValue(commentDoc);
    Comment.findByIdAndDelete = jest.fn().mockResolvedValue({});
    Image.findByIdAndUpdate = jest.fn().mockResolvedValue({});

    await commentController.deleteCommentByID(req, res);

    expect(Comment.findByIdAndDelete).toHaveBeenCalledWith('c1');
    expect(Image.findByIdAndUpdate).toHaveBeenCalledWith('img1', { $pull: { comments: 'c1' } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true, message: 'Delete sucessful' });
  });
});
