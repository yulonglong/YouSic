
public class Archive {

}

//short[] sampleData = WaveIO.readWave("C:/Users/Ian/Desktop/ACDC - Back In Black Edited.wav");
//double sampleMfcc[][] = mfcc.process(sampleData);
//double sampleEnergy[] = Energy.getFeature(sampleData);
//Song sample = new Song("Sample Artist", "Sample Title", sampleMfcc, sampleEnergy);
//ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("C:/Users/Ian/Desktop/ACDC - Back In Black Edited.wav.data"));
//oos.writeObject(sample);
//oos.close();


//private static void test3(MFCC mfcc) throws FileNotFoundException, IOException, ClassNotFoundException {
//	double d2[][] = mfcc.process(WaveIO.readWave("C:/Users/Ian/Desktop/sample4.wav"));
//
//	ObjectInputStream ois = new ObjectInputStream(new FileInputStream("C:/Users/Ian/Desktop/songs.db"));
//	Song song;
//
//	while(true) {
//		try {
//			song = (Song)ois.readObject();
//		} catch(EOFException e) {
//			break;
//		}
//
//		double d1[][] = song.getMfcc();
//		double max = Double.MIN_VALUE;
//		int max_index = -1;
//		for(int i = 0; i < d1.length; i++) {
//			double sim = Cosine.getDistance(d1[i], d2[0]);
//			if(sim > max) {
//				max_index = i;
//				max = sim;
//			}
//		}
//		System.out.println(song);
//		System.out.println(d1.length);
//		System.out.println(max);
//		System.out.println(max_index);
//		System.out.println();
//	}
//	System.out.println("Done");
//}
//
//private static void test2(MFCC mfcc) {
//	Song song1 = new Song("Sound of Silence", "Simon & Garfunkel", mfcc.process(WaveIO.readWave("C:/Users/Ian/Desktop/song1.wav")));
//	Song song2 = new Song("Hogwarts' March", "Patrick Doyle", mfcc.process(WaveIO.readWave("C:/Users/Ian/Desktop/song2.wav")));
//	try {
//		ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("C:/Users/Ian/Desktop/songs.db"));
//		oos.writeObject(song1);
//		oos.writeObject(song2);
//	} catch (IOException e) {
//		e.printStackTrace();
//	}
//	System.out.println("OK");
//}
//
//private static void test1(MFCC mfcc) {
//	long t1 = new Date().getTime();
//
//	short[] s1 = WaveIO.readWave("C:/Users/Ian/Desktop/song1.wav");
//	short[] s2 = WaveIO.readWave("C:/Users/Ian/Desktop/sample3.wav");
//
//	long t2 = new Date().getTime();
//
//	double d1[][] = mfcc.process(s1);
//	double d2[][] = mfcc.process(s2);
//
//	long t3 = new Date().getTime();
//
//	System.out.println(t2 - t1);
//	System.out.println(t3 - t2);
//	double min = Double.MAX_VALUE;
//	int min_index = -1;
//	for(int i = 0; i < d1.length; i++) {
//		double dist = Cosine.getDistance(d1[i], d2[0]);
//		if(dist < min) {
//			min_index = i;
//			min = dist;
//		}
//	}
//	System.out.println(d1.length);
//	System.out.println(min);
//	System.out.println(min_index);
//}