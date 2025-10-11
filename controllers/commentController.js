import Comment from "../models/comment.js";
import Image from "../models/Image.js";

const commentController ={
    addComment : async (req, res) => {
        try{
            const { imageId } = req.params;
            const { text } = req.body;
            const checkText = text.trim()
            if (!checkText){
                return res.status(400).json({message: "Comment can't be empty"})
            };
            const image = await Image.findById(imageId);//ข้างบนเช็ค " " อันนี้เช็คมีรูปจริงไหม
            if (!image){
                return res.status(404).json({ message: "NO IMGAGE" });
            } 
            const comment = await Comment.create({
            userId: req.user.id,  
            imageId,
            text: text.trim(),
            });

            image.comments.push(comment._id);
            await image.save();
            res.json({ ok: true, comment });

        }catch(err){
            console.error(err);
            res.status(500).json({ message: "Fail to creat comment" });
        }
      },
    
    getAllCommentByID : async (req, res) =>{
        try{
            const { imageId } = req.params;
            const comments = await Comment.find({ imageId })
            .populate("userId", "name").sort({ createdAt: -1 });
            res.json({ ok: true, comments });

        }catch(err){
            console.error(err);
            res.status(500).json({ message: "Fail to get all comment" });
        }
    },

    updateComment : async (req, res) =>{
        try{
            const { commentID } = req.params;
            const { text } = req.body;
            const checkText = text.trim()
            if (!checkText){
                return res.status(400).json({message: "Comment can't be empty"})
            };

            if (comment.userId.toString() !== req.user.id)
                return res.status(403).json({ message: "forbidden" });

             const comment = await Comment.findById(commentID);
                if (!comment) {
                return res.status(404).json({ message: "Comment not found" });
            }

            comment.text = checkText;
            comment.save();
            res.json({ ok: true, message: "Comment updated", comment });
        }catch(err){
            console.error(err);
            res.status(500).json({ message: "Fail to update comment" });
        }
        },

    deleteCommentByID : async (req, res) =>{
        try{
            const { commentID } = req.params;

           

            const comment = await Comment.findById(commentID);
                if (!comment) {
                return res.status(404).json({ message: "Comment not found" });
            }
                if (comment.userId.toString() !== req.user.id)
                return res.status(403).json({ message: "forbidden" });
            await Comment.findByIdAndDelete(commentID);
            await Image.findByIdAndUpdate(comment.imageId, { $pull: { comments: commentID } });

            res.json({ ok: true, message: "Delete sucessful" })
            
        }catch(err){
            console.error(err);
            res.status(500).json({ message: "Fail to delete comment" });
        }
    }
    }
    
    
    
    
    

export default commentController;