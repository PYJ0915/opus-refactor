package nknk.opus.project.selections.model.service;

import java.util.List;

import nknk.opus.project.selections.model.dto.Goods;
import nknk.opus.project.selections.model.dto.GoodsImg;
import nknk.opus.project.selections.model.dto.GoodsOption;

public interface SelectionsService {

	List<Goods> selectGoodsList();

	Goods selectGoodsDetail(int goodsNo);

	List<GoodsOption> selectGoodsOptions(int goodsNo);

	List<GoodsImg> selectGoodsImgList(int goodsNo);

	List<String> selectDbImgList();

}
