package nknk.opus.project.address.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import nknk.opus.project.address.model.dto.Address;
import nknk.opus.project.address.model.service.AddressService;

@RequestMapping("addresses")
@RestController
public class AddressController {

	@Autowired
	private AddressService service;

	// 배송지 목록 조회
	@GetMapping
	public ResponseEntity<Object> selectAddresses(Authentication authentication) {
		try {

			String memberNoStr = (String) authentication.getPrincipal();
	        int memberNo = Integer.parseInt(memberNoStr);

			List<Address> addresses = service.selectAddresses(memberNo);

			return ResponseEntity.status(HttpStatus.OK).body(addresses);

		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	// 배송지 추가
	@PostMapping
	public ResponseEntity<Address> addAddress(Authentication authentication, @RequestBody Address address) {
		
		String memberNoStr = (String) authentication.getPrincipal();
        int memberNo = Integer.parseInt(memberNoStr);
		
		Address addedAddress = service.addAddress(memberNo, address);
		
		return ResponseEntity.status(HttpStatus.CREATED).body(addedAddress);
	}
	
	// 배송지 수정
	@PutMapping("{addressNo}")
	public ResponseEntity<Address> updateAddress(Authentication authentication, 
											@RequestBody Address address, 
											@PathVariable("addressNo") int addressNo) {
		
		String memberNoStr = (String) authentication.getPrincipal();
        int memberNo = Integer.parseInt(memberNoStr);
		
		Address updatedAddress = service.updateAddress(memberNo, address, addressNo);
		
		return ResponseEntity.status(HttpStatus.OK).body(updatedAddress);
	}
	

	// 배송지 삭제
	@DeleteMapping("{addressNo}")
	public ResponseEntity<Void> deleteAddress(Authentication authentication, @PathVariable("addressNo") int addressNo) {
		
		String memberNoStr = (String) authentication.getPrincipal();
        int memberNo = Integer.parseInt(memberNoStr);
        
        service.deleteAddress(memberNo, addressNo);
        return ResponseEntity.noContent().build();
        
	}
	
	// 기본 배송지 설정
	@PutMapping("/{addressNo}/default")
	public ResponseEntity<Void> setDefaultAddress(@PathVariable("addressNo") int addressNo, 
			Authentication authentication) {
		
		String memberNoStr = (String) authentication.getPrincipal();
        int memberNo = Integer.parseInt(memberNoStr);
		
	   service.setDefaultAddress(addressNo, memberNo);
		
		return ResponseEntity.noContent().build();
	}

}
