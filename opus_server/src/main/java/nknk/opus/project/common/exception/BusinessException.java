package nknk.opus.project.common.exception;

/**
 * 비즈니스 로직 처리 중 발생하는 예외
 */
public class BusinessException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public BusinessException(String message) {
		super(message);
	}

	public BusinessException(String message, Throwable cause) {
		super(message, cause);
	}
}
