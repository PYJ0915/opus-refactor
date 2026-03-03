package nknk.opus.project.selections.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import nknk.opus.project.selections.model.dto.Goods;
import nknk.opus.project.selections.model.dto.GoodsImg;
import nknk.opus.project.selections.model.dto.GoodsOption;

@Mapper
public interface SelectionsMapper {

	List<Goods> selectGoodsList();

	Goods selectGoodsDetail(int goodsNo);

	List<GoodsOption> selectGoodsOptions(int goodsNo);

	List<GoodsImg> selectGoodsImgList(int goodsNo);

	List<String> selectDbImageList();

}
