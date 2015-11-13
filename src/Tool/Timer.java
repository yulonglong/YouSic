package Tool;

import java.util.Date;

public class Timer {
	private long lastTime = -1;
	private static Timer globalTimer = new Timer();

	public void time() {
		if(lastTime == -1)
			lastTime = new Date().getTime();
		else {
			long newTime = new Date().getTime();
			System.out.println("Time taken: " + (newTime - lastTime) + "ms");
			lastTime = newTime;
		}
	}

	public void reset() {
		lastTime = new Date().getTime();
	}

	public static void gtime() {
		globalTimer.time();
	}

	public static void greset() {
		globalTimer.reset();
	}
}
