package nknk.opus.project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication(exclude = {})
public class OpusServerApplication {

	public static void main(String[] args) {
		
		SpringApplication.run(OpusServerApplication.class, args);
				
	}
}