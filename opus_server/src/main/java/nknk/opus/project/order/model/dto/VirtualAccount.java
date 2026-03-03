package nknk.opus.project.order.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class VirtualAccount {

	private String accountType;
    private String accountNumber;
    private String bankCode;
    private String bankName;
    private String customerName;
    private String dueDate;
    private String refundStatus;
    private boolean expired;
    private String settlementStatus;
    
}
