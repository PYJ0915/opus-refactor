package nknk.opus.project.stage.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class StageCache {
    private String stageNo;        // KCISA/KOPIS ID (PK)
    private String stageType;      // "exhibition" | "musical"
    private String stageTitle;
    private String stageThumbnail;
    private String stagePeriod;
    private String stagePlace;
    private String cachedAt;
}