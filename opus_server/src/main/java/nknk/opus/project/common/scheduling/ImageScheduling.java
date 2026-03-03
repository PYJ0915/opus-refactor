package nknk.opus.project.common.scheduling;

import java.io.File;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;
import nknk.opus.project.selections.model.service.SelectionsService;

@Component
@Slf4j
@PropertySource("classpath:/config.properties")
public class ImageScheduling {
	
	@Value("${opus.board.folder-path}")
	private String boardFolderPath;

	@Value("${opus.goods.folder-path}")
	private String goodsFolderPath;

	@Autowired
	private SelectionsService service;

	@Scheduled(cron = "0 5 0 * * *")
	public void imageDeleteScheduling() {
		log.info("스케줄러 동작!");

		// 1. 서버 폴더의 파일 목록 조회

		// 서버 폴더 파일 목록 조회할 경로 설정
		File boardFolder = new File(boardFolderPath);
		File memberFolder = new File(goodsFolderPath);

		// 설정한 경로의 파일 목록 얻어오기
		File[] boardArr = boardFolder.listFiles();
		File[] memberArr = memberFolder.listFiles();

		// 두 배열을 하나로 합치기

		// 1) 두 배열의 길이의 합의 크기를 가진 배열 만들기
		File[] imgArr = new File[boardArr.length + memberArr.length];

		// 2) 배열 내용 복사를 통해 하나의 합친 배열로 만들기 (깊은 복사)
		System.arraycopy(memberArr, 0, imgArr, 0, memberArr.length);
		System.arraycopy(boardArr, 0, imgArr, memberArr.length, boardArr.length);

		// 배열 -> List
		List<File> serverImageList = Arrays.asList(imgArr);

		// 2. DB에 저장된 이미지 파일들 이름만 조회
		List<String> dbImageList = service.selectDbImgList();

		// 3. 서버에만 존재하고, DB에 없는 파일들 서버에서 삭제
		if (!serverImageList.isEmpty()) {
			for (File serverImg : serverImageList) {
				// List.indexOf(객체) : List에 전달한 객체가 존재하면 존재하는 index 번호 반환
				if (dbImageList.indexOf(serverImg.getName()) == -1) {
					serverImg.delete();
					log.info(serverImg.getName() + " 파일이 삭제 되었습니다.");
				}
			}
		}

	}
}
