package nknk.opus.project.selections.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import nknk.opus.project.selections.model.dto.Goods;
import nknk.opus.project.selections.model.dto.GoodsImg;
import nknk.opus.project.selections.model.dto.GoodsOption;
import nknk.opus.project.selections.model.service.SelectionsService;

@RestController
@RequestMapping("selections")
@RequiredArgsConstructor
public class SelectionsController {

	private final SelectionsService service;
	
	@GetMapping
	public ResponseEntity<List<Goods>> selectGoodsList() {
	    List<Goods> goodsList = service.selectGoodsList();
	    return ResponseEntity.ok(goodsList);
	}

	@GetMapping("{goodsNo}")
	public ResponseEntity<Goods> selectGoodsDetail(@PathVariable("goodsNo") int goodsNo) {
	    Goods goodsDetail = service.selectGoodsDetail(goodsNo);
	    return ResponseEntity.ok(goodsDetail);
	}

	@GetMapping("{goodsNo}/options")
	public ResponseEntity<List<GoodsOption>> selectGoodsOptions(@PathVariable("goodsNo") int goodsNo) {
	    List<GoodsOption> options = service.selectGoodsOptions(goodsNo);
	    return ResponseEntity.ok(options);
	}

	@GetMapping("{goodsNo}/images")
	public ResponseEntity<List<GoodsImg>> selectGoodsImgList(@PathVariable("goodsNo") int goodsNo) {
	    List<GoodsImg> imgList = service.selectGoodsImgList(goodsNo);
	    return ResponseEntity.ok(imgList);
	}
	
}
