import java.io.EOFException;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.PriorityQueue;

import Database.Song;
import Distance.Cosine;
import Feature.MFCC;
import SignalProcess.WaveIO;
import Tool.ObjectIO;
import Tool.Timer;

public class Main {

	private static final double MFCC_SIMILARITY_THRESHOLD = 0.98;
	private static final double MFCC_ACCEPTANCE_THRESHOLD = 0.99;
	private static final int FRAME_COUNT_ACCEPTANCE_THRESHOLD = 4; // Multiply by 1.5 secs for actual length.

	private static final FilenameFilter WAV_EXTENSION_FILTER = new FilenameFilter() {
		@Override
		public boolean accept(File dir, String name) {
			if (name.toLowerCase().endsWith(".wav"))
				return true;
			return false;
		}
	};
	private static final FilenameFilter DB_EXTENSION_FILTER = new FilenameFilter() {
		@Override
		public boolean accept(File dir, String name) {
			if (name.toLowerCase().endsWith(".db"))
				return true;
			return false;
		}
	};

	public static void main(String[] args) throws FileNotFoundException, IOException, ClassNotFoundException {
		//Notes for input: input should be 44100 Hz, Mono, 16-bit per sample. Remove metadata too.

		// ~6 second window with ~1.5 secs shift (~4.5 secs overlap)
		// Actual window = 262144/44100 = ~5.944 secs
		MFCC mfcc = new MFCC(131072, 131072/2);

//		ObjectIO.writeObject("C:/Users/Ian/Google Drive/Music/TestcaseVideo/tc1.db", generateSongObject(mfcc, "C:/Users/Ian/Google Drive/Music/TestcaseVideo/tc1.wav"));
//		ObjectIO.writeObject("C:/Users/Ian/Google Drive/Music/TestcaseVideo/tc2.db", generateSongObject(mfcc, "C:/Users/Ian/Google Drive/Music/TestcaseVideo/tc2.wav"));
//		ObjectIO.writeObject("C:/Users/Ian/Google Drive/Music/TestcaseVideo/tc3.db", generateSongObject(mfcc, "C:/Users/Ian/Google Drive/Music/TestcaseVideo/tc3.wav"));
//		ObjectIO.writeObject("C:/Users/Ian/Google Drive/Music/TestcaseVideo/tc4.db", generateSongObject(mfcc, "C:/Users/Ian/Google Drive/Music/TestcaseVideo/tc4.wav"));
//		ObjectIO.writeObject("C:/Users/Ian/Google Drive/Music/TestcaseVideo/tc5.db", generateSongObject(mfcc, "C:/Users/Ian/Google Drive/Music/TestcaseVideo/tc5.wav"));
//		System.out.println("Done");

		//createSongsDatabase(mfcc, "C:/Users/Ian/Google Drive/Music/Testcase_wav", "C:/Users/Ian/Desktop/songs.db");
		//mergeSongsDatabase("C:/Users/Ian/Desktop/songs.db");
		match(mfcc, "C:/Users/Ian/Google Drive/Music/TestcaseVideo/tc5.wav", "C:/Users/Ian/Desktop/songs.db");
	}

	private static void createSongsDatabase(MFCC mfcc, String folderPath, String databaseFilePath) throws FileNotFoundException, IOException {
		File files[] = new File(folderPath).listFiles(WAV_EXTENSION_FILTER);

		File individualFolder = new File(databaseFilePath + "-indiv/");
		individualFolder.mkdirs();

		for(int i = 0; i < files.length; i++) {
			Timer.gtime();
			System.out.println("Processing " + (i+1) + " out of " + files.length);

			Song song = generateSongObject(mfcc, files[i]);
			ObjectIO.writeObject(databaseFilePath + "-indiv/" + files[i].getName().replace(".wav", ".db"), song);

			System.out.println("Processed " + song);
		}
		System.out.println("Done.");
	}

	private static void mergeSongsDatabase(String databaseFilePath) throws FileNotFoundException, IOException, ClassNotFoundException {
		ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(databaseFilePath));

		File individualFolder = new File(databaseFilePath + "-indiv/");
		File files[] = individualFolder.listFiles(DB_EXTENSION_FILTER);

		for(int i = 0; i < files.length; i++) {
			System.out.println("Processing " + (i+1) + " out of " + files.length);

			Song song = (Song)ObjectIO.readObject(files[i]);
			oos.writeObject(song);

			System.out.println("Processed " + song);
		}
		oos.close();
		System.out.println("Done.");
	}

	private static void match(MFCC mfcc, String sampleFilePath, String databaseFilePath) throws FileNotFoundException, ClassNotFoundException, IOException {
		match(mfcc, new File(sampleFilePath), databaseFilePath);
	}

	private static void match(MFCC mfcc, File sampleFilePath, String databaseFilePath) throws FileNotFoundException, IOException, ClassNotFoundException {
		System.out.println("Processing sample...");
		Timer.greset();

		Song sample = (Song)ObjectIO.readObject("C:/Users/Ian/Google Drive/Music/TestcaseVideo/tc5.db");
		double sampleMfcc[][] = sample.getMfcc();

//		short[] sampleData = WaveIO.readWave(sampleFilePath);
//		double sampleMfcc[][] = mfcc.process(sampleData);
		int sampleLength = sampleMfcc.length;

		System.out.println("Sample processed. Matching...");
		Timer.gtime();

		ObjectInputStream ois = new ObjectInputStream(new FileInputStream(databaseFilePath));
		PriorityQueue<Result> results = new PriorityQueue<Result>();

		while(true) {
			Song song;
			try {
				song = (Song)ois.readObject();
			} catch(EOFException e) {
				break;
			}

//			if(!song.getArtist().equals("Steve Jablonsky")) continue;
//			else System.out.println("Steve Jablonsky");

			PriorityQueue<Result> songResults = new PriorityQueue<Result>();

			int songLength = song.getMfcc().length;

			int i, j, k;
			for(i = 0; i < songLength; i++) {
				for(k = 0; k < sampleLength; k++) { // sampleOffset
					double totalMfccScores = 0.0;

					for(j = k; j < sampleLength && i + j < songLength; j++) {
						double mfccSimilarity = Cosine.getDistance(song.getMfcc()[i + j], sampleMfcc[j]);
						if(mfccSimilarity < MFCC_SIMILARITY_THRESHOLD)
							break;

						totalMfccScores += mfccSimilarity;
					}

					int frameCount = j - k;

					if(frameCount >= FRAME_COUNT_ACCEPTANCE_THRESHOLD && totalMfccScores / frameCount >= MFCC_ACCEPTANCE_THRESHOLD) {
						songResults.add(new Result(totalMfccScores / frameCount, i, k, frameCount, song.toString()));
					}
				}
			}

//			System.out.println("PRE: " + songResults.size());
			flattenResults(songResults, songLength, sampleLength);
//			System.out.println("POST: " + songResults.size());
			results.addAll(songResults);
		}

		System.out.println("Results count: " + results.size());
		int printCount = 0;
		while(!results.isEmpty() && printCount != 100) {
			System.out.println(results.poll());
			printCount++;
		}
		ois.close();
		System.out.println("Matching done.");
		Timer.gtime();
	}

	private static void flattenResults(PriorityQueue<Result> results, int songLength, int sampleLength) {
		if(results.isEmpty()) return;

//		System.out.println("\n\n\n\n\n\n");

		String songName = results.peek().getSong();

		double mfccScores[] = new double[sampleLength];
		while(!results.isEmpty()) {
			Result r = results.poll();
//			System.out.println(r);
			for(int i = 0; i < r.getLength(); i++) {
				if(mfccScores[r.getSampleStartPosition() + i] == 0.0) {
					mfccScores[r.getSampleStartPosition() + i] = r.getMfcc();
				}
			}
		}

//		System.out.println(songName);
//		System.out.println(Arrays.toString(mfccScores));

		double totalMfccScore = 0.0;
		int totalMfccCount = 0;
		int i;
		for(i = 0; i < mfccScores.length; i++) {

			if(mfccScores[i] == 0.0) {
				if(totalMfccCount != 0) {
					//new Result(mfcc, songStartPosition, sampleStartPosition, length, song)
					results.add(new Result(totalMfccScore / totalMfccCount, -1, i - totalMfccCount, totalMfccCount, songName));
					totalMfccScore = 0.0;
					totalMfccCount = 0;
				}
			}
			else {
				totalMfccScore += mfccScores[i];
				totalMfccCount++;
			}
		}

		if(totalMfccCount != 0) {
			results.add(new Result(totalMfccScore / totalMfccCount, -1, i, totalMfccCount, songName));
			totalMfccScore = 0.0;
			totalMfccCount = 0;
		}
	}

	private static Song generateSongObject(MFCC mfcc, String filename) {
		return generateSongObject(mfcc, new File(filename));
	}

	private static Song generateSongObject(MFCC mfcc, File file) {
		Song song;
		String[] artistAndTitle = file.getName().replace(".wav", "").split(" - ", 2);
		short[] data = WaveIO.readWave(file);
		if(artistAndTitle.length == 2) {
			song = new Song(
					artistAndTitle[0],
					artistAndTitle[1],
					mfcc.process(data),
					null
					);
		}
		else {
			song = new Song(
					null,
					file.getName().replace(".wav", ""),
					mfcc.process(data),
					null
					);
		}
		return song;
	}
}

