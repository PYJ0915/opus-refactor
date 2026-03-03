package nknk.opus.project.selections.model.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import nknk.opus.project.selections.model.dto.Goods;
import nknk.opus.project.selections.model.dto.GoodsImg;
import nknk.opus.project.selections.model.dto.GoodsOption;
import nknk.opus.project.selections.model.mapper.SelectionsMapper;

@Transactional(rollbackFor = Exception.class)
@Service
public class SelectionsServiceImpl implements SelectionsService{
	
	@Autowired
	private SelectionsMapper mapper;

	@Override
	public List<Goods> selectGoodsList() {
		
		List<Goods> goodsList = mapper.selectGoodsList();
		
		for(Goods goods : goodsList) {
			String goodsThumbnail = goods.getGoodsImgPath() + goods.getGoodsImgRe();
			goods.setGoodsThumbnail(goodsThumbnail);
		}
		
		return goodsList;
	}

	@Override
	public Goods selectGoodsDetail(int goodsNo) {
		
		Goods goodsDetail = mapper.selectGoodsDetail(goodsNo);
		
		String goodsThumbnail = goodsDetail.getGoodsImgPath() + goodsDetail.getGoodsImgRe();
		goodsDetail.setGoodsThumbnail(goodsThumbnail);
		
		return goodsDetail;
	}

	@Override
	public List<GoodsOption> selectGoodsOptions(int goodsNo) {
		return mapper.selectGoodsOptions(goodsNo);
	}

	@Override
	public List<GoodsImg> selectGoodsImgList(int goodsNo) {
		
		List<GoodsImg> goodsImgList = mapper.selectGoodsImgList(goodsNo);
		
		for(GoodsImg goodsImg : goodsImgList) {
			String goodsImgFullpath = goodsImg.getGoodsImgPath() + goodsImg.getGoodsImgRe();
			goodsImg.setGoodsImgFullpath(goodsImgFullpath);
		}
		
		return goodsImgList;
	}
	
	@Override
	public List<String> selectDbImgList() {
		return mapper.selectDbImageList();
	}
	
}
