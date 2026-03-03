package nknk.opus.project.address.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Address {
	
	private int addressNo;
	private int memberNo;
	private String recipient;
	private String recipientTel;
	private String postcode;
	private String basicAddress;
	private String detailAddress;
	private String isDefault;
	private String deliveryReq;
	private String addressWriteDate;
	private String addressUpdateDate;

}
