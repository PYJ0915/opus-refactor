package nknk.opus.project.address.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import nknk.opus.project.address.model.dto.Address;

@Mapper
public interface AddressMapper {

	List<Address> selectAddresses(int memberNo);

	int addAddress(Address address);

	int updateAddress(Address address);

	int deleteAddress(Map<String, Object> map);

	void clearDefaultAddress(int memberNo);

	int setDefaultAddress(int addressNo);
	
}
