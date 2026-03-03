package nknk.opus.project.member.model.service;

import java.util.Map;

import nknk.opus.project.member.model.dto.Member;

public interface MemberService {

  Member login(Member inputMember);

  void sendEmail(String email);

  boolean verifyCode(String email, String code);

  int signup(Member inputMember);

  boolean checkEmail(String email);

  boolean checkTel(String tel);

  int updateTel(Member inputMember);

  int changePw(Map<String, Object> param);

  int getActiveTransactionCount(int memberNo);

  boolean withdrawMember(int memberNo);

  Member loginGoogle(String googleAccessToken);

  int googleRegister(Member inputMember);

  Member getMemberByEmail(String email);

  Member getMemberByMemberNo(int memberNo);

  String getCurrentPw(int memberNo);
}