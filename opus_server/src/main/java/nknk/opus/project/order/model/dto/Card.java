package nknk.opus.project.order.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Card {
	private String company;
    private String number;
    private String installmentPlanMonths;
    private String approveNo;
    private String cardType;
    private String ownerType;
    private String acquireStatus;
}
