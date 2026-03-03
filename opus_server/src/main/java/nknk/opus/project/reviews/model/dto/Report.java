package nknk.opus.project.reviews.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Report {
    private int reportNo;
    private String reportReason;
    private String reportDetail;
    private String reportDate;
    private String reportStatus;
    private int reporterNo;
    private int reportedNo;
    private int reviewNo;
}
