package nknk.opus.project.selections.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import nknk.opus.project.selections.model.dto.Goods;
import nknk.opus.project.selections.model.dto.GoodsImg;
import nknk.opus.project.selections.model.dto.GoodsOption;
import nknk.opus.project.selections.model.service.SelectionsService;

@RestController
@RequestMapping("selections")
public class SelectionsController {

	@Autowired
	private SelectionsService service;
	
	@GetMapping
	public ResponseEntity<Object> selectGoodsList() {
		try {
			
			List<Goods> goodsList = service.selectGoodsList();
			
			return ResponseEntity.status(HttpStatus.OK).body(goodsList);
			
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
			
		}
	}
	
	@GetMapping("{goodsNo}")
	public ResponseEntity<Object> selectGoodsDetail(@PathVariable("goodsNo") int goodsNo) {
		
		try {
			
			Goods goodsDetail = service.selectGoodsDetail(goodsNo);
			
			return ResponseEntity.status(HttpStatus.OK).body(goodsDetail);
			
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
		
	}
	
	@GetMapping("{goodsNo}/options")
	public ResponseEntity<Object> selectGoodsOptions(@PathVariable("goodsNo") int goodsNo) {
		
		try {
			
			List<GoodsOption> goodsOptions = service.selectGoodsOptions(goodsNo);
			
			return ResponseEntity.status(HttpStatus.OK).body(goodsOptions);
			
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
		
	}
	
	@GetMapping("{goodsNo}/images")
	public ResponseEntity<Object> selectGoodsImgList(@PathVariable("goodsNo") int goodsNo) {
		
		try {
			
			List<GoodsImg> goodsImgList = service.selectGoodsImgList(goodsNo);
			
			return ResponseEntity.status(HttpStatus.OK).body(goodsImgList);
			
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
		
	}
	
}
