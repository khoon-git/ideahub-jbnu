/*define UserSchema and [static] methods to store user infomation in mongoDB.*/

import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt'; //해싱 함수를 지원하는 라이브러리
import jwt from 'jsonwebtoken';

const UserSchema = new Schema({
  username: String,
  role: {
    type: String,
    default: 'visiter',
  }, //사용자의 역할(admin, writer, visiter)
  hashedPassword: String,
});

//비밀번호를 parameter로 받아 해싱된 비밀번호를 설정
UserSchema.methods.setPassword = async function(password) {
  const hash = await bcrypt.hash(password, 10);
  this.hashedPassword = hash;
};

//hash inputed password, compare it with password in DB
UserSchema.methods.checkPassword = async function(password) {
  const result = await bcrypt.compare(password, this.hashedPassword);
  return result;
};

//static 함수에서의 this는 모델(현재는 User)를 가리킴
UserSchema.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

UserSchema.methods.serialize = function() {
  const data = this.toJSON();
  //hashedPassword 필드가 응답하지 않도록 데이터를 JSON으로 변환한 후 필드 삭제
  delete data.hashedPassword;
  return data;
};

UserSchema.methods.generateToken = function() {
  const token = jwt.sign(
    //첫번째 파라미터는 토큰 안에 집어넣고 싶은 데이터
    {
      _id: this.id,
      username: this.username,
      role: this.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    },
  );
  return token;
};

const User = mongoose.model('User', UserSchema);
export default User;
