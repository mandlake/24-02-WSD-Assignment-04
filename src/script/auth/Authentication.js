// script.js
const tryLogin = (email, password, success, fail, saveToken = true) => {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const user = users.find(
    (user) => user.id === email && user.password === password
  );

  if (user) {
    if (saveToken) {
      localStorage.setItem("TMDb-Key", user.password);
    }
    success(user);
  } else {
    fail();
  }
};

const tryRegister = (email, password, success, fail) => {
  try {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userExists = users.some((existingUser) => existingUser.id === email);

    if (userExists) {
      throw new Error("User already exists");
    }

    const newUser = { id: email, password: password };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    success();
  } catch (err) {
    fail(err);
  }
};

import * as Kakao from "kakao-js-sdk";

// 카카오 로그인 함수 추가
const tryKakaoLogin = async (success, fail) => {
  try {
    const authResult = await Kakao.Auth.login({
      scope: "profile_nickname, account_email", // 필요한 정보만 요청
    });
    console.log(authResult);

    // 로그인 성공 시 사용자 정보 가져오기
    const profile = await Kakao.API.user.me();
    const user = {
      id: profile.id, // 카카오 사용자 고유번호
      email: profile.kakao_account.email, // 이메일 (선택사항)
      nickname: profile.properties.nickname, // 닉네임
    };

    success(user);
  } catch (error) {
    console.error(error);
    fail(error);
  }
};

export { tryLogin, tryRegister, tryKakaoLogin };
