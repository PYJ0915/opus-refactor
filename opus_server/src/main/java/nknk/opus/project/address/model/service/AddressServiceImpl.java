package nknk.opus.project.address.model.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import nknk.opus.project.address.model.dto.Address;
import nknk.opus.project.address.model.mapper.AddressMapper;
import nknk.opus.project.common.exception.BusinessException;

@Transactional(rollbackFor = Exception.class)
@Service
public class AddressServiceImpl implements AddressService {

	@Autowired
	private AddressMapper mapper;

	@Override
	public List<Address> selectAddresses(int memberNo) {
		return mapper.selectAddresses(memberNo);
	}

	@Override
	public Address addAddress(int memberNo, Address address) {

		address.setMemberNo(memberNo);

		int result = mapper.addAddress(address);

		if (result != 1) {
			throw new BusinessException("배송지 추가에 실패했습니다.");
		}

		return address;
	}

	@Override
	public Address updateAddress(int memberNo, Address address, int addressNo) {

		address.setAddressNo(addressNo);
		address.setMemberNo(memberNo);

		int result = mapper.updateAddress(address);

		if (result != 1) {
			throw new BusinessException("배송지 수정에 실패했습니다.");
		}

		return address;
	}

	@Override
	public void deleteAddress(int memberNo, int addressNo) {

		Map<String, Object> map = new HashMap<>();

		map.put("memberNo", memberNo);
		map.put("addressNo", addressNo);

		int result = mapper.deleteAddress(map);

		if (result != 1) {
			throw new BusinessException("배송지 삭제에 실패했습니다.");
		}

	}

	@Override
	public void setDefaultAddress(int addressNo, int memberNo) {

		// 기존 기본 배송지 해제
		mapper.clearDefaultAddress(memberNo);

		// 새로운 기본 배송지 설정
		int result = mapper.setDefaultAddress(addressNo);
		
		if (result != 1) {
			throw new BusinessException("기본 배송지 설정에 실패했습니다.");
		}
		
	}

}
