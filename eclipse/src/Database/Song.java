package Database;

import java.io.Serializable;

public class Song implements Serializable {

	private static final long serialVersionUID = -6391916637202048717L;
	private String title;
	private String artist;
	private String comments;
	private double mfcc[][];
	private double energy[];

	public Song() {
	}

	public Song(String artist, String title) {
		this.title = title;
		this.artist = artist;
	}

	public Song(String artist, String title, double mfcc[][], double energy[]) {
		this(artist, title);
		this.mfcc = mfcc;
		this.energy = energy;
	}

	public Song(String artist, String title, String comments, double mfcc[][], double energy[]) {
		this(artist, title, mfcc, energy);
		this.comments = comments;
	}

	@Override
	public String toString() {
		return artist + " - " + title;
	}

	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getArtist() {
		return artist;
	}
	public void setArtist(String artist) {
		this.artist = artist;
	}
	public String getComments() {
		return comments;
	}
	public void setComments(String comments) {
		this.comments = comments;
	}
	public double[][] getMfcc() {
		return mfcc;
	}
	public void setMfcc(double[][] mfcc) {
		this.mfcc = mfcc;
	}

	public double[] getEnergy() {
		return energy;
	}

	public void setEnergy(double energy[]) {
		this.energy = energy;
	}
}
