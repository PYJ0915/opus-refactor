package nknk.opus.project.member.model.mapper;

import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import nknk.opus.project.member.model.dto.Member;

@Mapper
public interface MemberMapper {

	Member login(@Param("memberEmail") String memberEmail);

	int signup(Member inputMember);

	int updateTel(Member inputMember);

	int checkTel(@Param("tel") String tel);

	int checkEmail(@Param("email") String email);

	String selectCurrentPw(@Param("memberNo") int memberNo);

	int changePw(Map<String, Object> param);

	int getActiveTransactionCount(@Param("memberNo") int memberNo);

	int withdrawMember(@Param("memberNo") int memberNo);

	Member findByEmail(@Param("memberEmail") String email);

	void insertMember(Member member);

	/**
	 * 회원번호로 이메일 조회 for 낙찰 이후 설명 메일 전송
	 * 
	 * @param memberNo
	 * @return by Sanghoo
	 */
	String findEmailByMemberNo(int memberNo);

	/**
	 * @param memberNo
	 * @return
	 */
	Member findByMemberNo(int memberNo);
}
