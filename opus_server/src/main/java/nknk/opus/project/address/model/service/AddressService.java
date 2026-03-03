package nknk.opus.project.address.model.service;

import java.util.List;

import nknk.opus.project.address.model.dto.Address;

public interface AddressService {

	List<Address> selectAddresses(int memberNo);

	Address addAddress(int memberNo, Address address);

	Address updateAddress(int memberNo, Address address, int addressNo);

	void deleteAddress(int memberNo, int addressNo);

	void setDefaultAddress(int addressNo, int memberNo);

}
