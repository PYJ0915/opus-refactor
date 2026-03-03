package nknk.opus.project.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.servlet.MultipartConfigElement;

@Configuration
@PropertySource("classpath:/config.properties")
public class FileConfig implements WebMvcConfigurer {

	// 파일 업로드 임계값
	@Value("${spring.servlet.multipart.file-size-threshold}")
	private long fileSizeThreshold; // 52428800

	// 임계값 초과 시 파일의 임시 저장 경로
	@Value("${spring.servlet.multipart.location}")
	private String location; // C:/uploadFiles/temp/

	// 요청 당 파일 최대 크기
	@Value("${spring.servlet.multipart.max-request-size}")
	private long maxRequestSize; // 52428800

	// 개별 파일 당 최대 크기
	@Value("${spring.servlet.multipart.max-file-size}")
	private long maxFileSize; // 10485760

	// 굿즈 이미지 관련 경로

	// 요청
	@Value("${opus.goods.resource-handler}")
	private String goodsResourceHandler;

	// 실제 파일
	@Value("${opus.goods.resource-location}")
	private String goodsResourceLocation;
	
	
	// 게시판 이미지 관련 경로
	// 요청
	@Value("${opus.board.resource-handler}")
	private String boardResourceHandler;

	// 실제 파일
	@Value("${opus.board.resource-location}")
	private String boardResourceLocation;
	
	// 굿즈 업로드 경로
	@Value("${opus.goods.upload-path}")
	private String goodsUploadPath;
	
	
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler(goodsResourceHandler).addResourceLocations(goodsResourceLocation);
	    registry.addResourceHandler(boardResourceHandler).addResourceLocations(boardResourceLocation);
	}

	// MultipartResolver 설정
	// MultipartConfigElement
	// : 파일 업로드를 처리하는데 사용되는 MultipartConfigElement를 구성하고 반환 (옵션 설정하는데 사용)
	// => 업로드 파일의 최대 크기, 임시 저장 경로 등...
	@Bean
	public MultipartConfigElement configElement() {

		MultipartConfigFactory factory = new MultipartConfigFactory();

		// 파일 업로드 임계값
		factory.setFileSizeThreshold(DataSize.ofBytes(fileSizeThreshold));

		// 임시 저장 폴더 경로
		factory.setLocation(location);

		// HTTP 요청 당 파일 최대 크기
		factory.setMaxRequestSize(DataSize.ofBytes(maxRequestSize));

		// 개별 파일 당 최대 크기
		factory.setMaxFileSize(DataSize.ofBytes(maxFileSize));

		return factory.createMultipartConfig();

	}

	// MultipartResolver 객체를 생성하여 Bean으로 등록
	// => 위에서 만든 MultipartConfigElement를 자동으로 이용
	// MultipartResolver : MultipartFile을 처리해주는 해결사
	// => 클라이언트로 받은 multipart 요청을 처리하고, 그 중 업로드된 파일을 추출하여 MultipartFile 객체로 제공하는 역할
	@Bean
	public MultipartResolver multipartResolver() {
		return new StandardServletMultipartResolver();
	}

	public String getGoodsUploadPath() {
	    return goodsUploadPath;
	}
	
}
