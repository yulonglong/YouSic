import java.util.Date;

import Distance.Cosine;
import Feature.MFCC;
import SignalProcess.WaveIO;

public class Main {

	public static void main(String[] args) {
		//Notes for input: input should be 44100 Hz, Mono, 16-bit per sample.

		// ~6 second window with ~1.5 secs shift (~4.5 secs overlap)
		// Actual window = 262144/44100 = ~5.944 secs
		MFCC mfcc = new MFCC(262144, 262144/4*3);

		long t1 = new Date().getTime();

		short[] s1 = WaveIO.readWave("C:/Users/Ian/Desktop/song1.wav");
		short[] s2 = WaveIO.readWave("C:/Users/Ian/Desktop/sample3.wav");

		long t2 = new Date().getTime();

		double d1[][] = mfcc.process(s1);
		double d2[][] = mfcc.process(s2);

		long t3 = new Date().getTime();

		System.out.println(t2 - t1);
		System.out.println(t3 - t2);
		double min = Double.MAX_VALUE;
		int min_index = -1;
		for(int i = 0; i < d1.length; i++) {
			double dist = Cosine.getDistance(d1[i], d2[0]);
			if(dist < min) {
				min_index = i;
				min = dist;
			}
		}
		System.out.println(d1.length);
		System.out.println(min);
		System.out.println(min_index);

	}

}
