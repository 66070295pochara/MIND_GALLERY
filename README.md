#  Mind Gallery

Mind Gallery คือเว็ปแพลตฟอร์มสร้างขึ้นเพื่อแก้ปัญหาการจัดเก็บและเผยแพร่ผลงาน
รูปภาพ โปรเจคนี้ช่วยให้ผู้ใช้สามารถอัปโหลดรูปภาพพร้อมกำหนดความเป็นส่วนตัว และสามารถชื่นชมผลงานต่างๆที่ผู้ใช้อื่นได้อัปโหลด และสามารถกดชื่นชอบรวมไปถึงแสดงความคิดเห็นต่อผลงานของกันและกันได้อย่างง่ายดาย เป็นการเปลี่ยนการจัดเก็บไฟล์แบบเดิมๆ ให้เป็นโอกาสในการแบ่งปันและสร้างสรรค์ผลงานต่างๆ

รันการทำงานฝั่งเซิร์ฟเวอร์ด้วย Node.js + Express + EJS และเก็บข้อมูลใน MongoDB

# Mind Gallery Preview


## ✨ Features
- **Authentication:** ระบบ Login/Register รักษาความปลอดภัยด้วย JWT (`JWT_SECRET`)
- **Gallery Visibility:** ผู้ใช้สามารถตั้งค่ารูปภาพเป็น Public (สาธารณะ) หรือ Private (ส่วนตัว) ได้
- **Interactions:** ระบบ Like และ Comment (อนุญาตให้แก้ไข/ลบได้เฉพาะเจ้าของคอมเมนต์หรือรูปภาพเท่านั้น)
- **SSR (Server-Side Rendering):** แสดงผลหน้าเว็บด้วย EJS 

## 🧰 Tech Stack
- **Server:** Node.js, Express.js, EJS
- **Database:** MongoDB (Mongoose)
- **Testing:** Jest

## 🚀 เริ่มต้นใช้งาน (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
npm install
