import { get, ref, set } from "firebase/database";
import { database } from "../firebaseDatabaseConfig";
import { AudioType, DBRegion, FavoriteList, Sex } from "./constants";

export type UrlWithMetadata = { url: string; location: string; author: string };

export type BirdAudio = {
  [AudioType.CAll]: UrlWithMetadata[];
  [AudioType.SONG]: UrlWithMetadata[];
};

export type BirdImage = {
  [Sex.MALE]: UrlWithMetadata[];
  [Sex.FEMALE]: UrlWithMetadata[];
};

/**
 * Helper function to fetch media data and push to results array.
 * @param url - endpoint to fetch data from.
 * @param results - array to push formatted media items.
 * @param urlField - key holding the URL in the response item.
 * @param predicate - function to verify whether the item should be included.
 * @param maxCount - maximum items allowed.
 */
const fetchMedia = async (
  url: string,
  results: UrlWithMetadata[],
  urlField: string,
  predicate: (item: any) => boolean,
  maxCount: number = 10
) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  data?.results?.content?.forEach((item: any) => {
    if (item[urlField] && predicate(item) && results.length < maxCount) {
      results.push({
        url: item[urlField],
        location: item.location || "Unknown",
        author: item.userDisplayName || "Unknown",
      });
    }
  });
};

export const fetchAudioForOne = async (
  id: string,
  region: string
): Promise<BirdAudio | null> => {
  const dbRef = ref(database, `v2/birbs/${id}/${region}/audio`);
  try {
    const snapshot = await get(dbRef);
    if (snapshot.exists()) return snapshot.val() as BirdAudio;
  } catch (error) {
    console.error("Error reading from Firebase:", error);
  }

  const birdAudio: BirdAudio = {
    [AudioType.CAll]: [],
    [AudioType.SONG]: [],
  };

  try {
    // Fetch call audio
    const callBaseUrl = `https://search.macaulaylibrary.org/api/v1/search?taxonCode=${id}&tag=call&mediaType=audio&sort=rating_rank_desc&limit=10`;
    const callRegionUrl = callBaseUrl + `&regionCode=${region}`;
    await fetchMedia(
      callRegionUrl,
      birdAudio[AudioType.CAll],
      "mediaUrl",
      (item) =>
        String(item.behaviors).toLowerCase() === AudioType.CAll &&
        item?.source === "ebird" &&
        item?.rating >= 4
    );
    if (birdAudio[AudioType.CAll].length < 10) {
      await fetchMedia(
        callBaseUrl,
        birdAudio[AudioType.CAll],
        "mediaUrl",
        (item) =>
          String(item.behaviors).toLowerCase().includes(AudioType.CAll) &&
          item?.source === "ebird"
      );
    }

    // Fetch song audio
    const songBaseUrl = `https://search.macaulaylibrary.org/api/v1/search?taxonCode=${id}&tag=song&mediaType=audio&sort=rating_rank_desc&limit=10`;
    const songRegionUrl = songBaseUrl + `&regionCode=${region}`;
    await fetchMedia(
      songRegionUrl,
      birdAudio[AudioType.SONG],
      "mediaUrl",
      (item) =>
        String(item.behaviors).toLowerCase() === AudioType.SONG &&
        item?.source === "ebird" &&
        item?.rating >= 4
    );
    if (birdAudio[AudioType.SONG].length < 10) {
      await fetchMedia(
        songBaseUrl,
        birdAudio[AudioType.SONG],
        "mediaUrl",
        (item) =>
          String(item.behaviors).toLowerCase().includes(AudioType.SONG) &&
          item?.source === "ebird"
      );
    }

    // Save to Firebase
    try {
      await set(dbRef, birdAudio);
      // console.log("Saved audio data to Firebase for id:", id);
    } catch (error) {
      console.error("Error saving to Firebase:", error);
    }

    return birdAudio;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const fetchImageForOne = async (
  id: string,
  region: string
): Promise<BirdImage | null> => {
  const dbRef = ref(database, `v2/birbs/${id}/${region}/image`);
  try {
    const snapshot = await get(dbRef);
    if (snapshot.exists()) return snapshot.val() as BirdImage;
  } catch (error) {
    console.error("Error reading from Firebase:", error);
  }

  const birdImage: BirdImage = {
    [Sex.MALE]: [],
    [Sex.FEMALE]: [],
  };

  try {
    // Fetch male images
    const maleBaseUrl = `https://search.macaulaylibrary.org/api/v1/search?taxonCode=${id}&sex=male&mediaType=photo&sort=rating_rank_desc&limit=10`;
    const maleRegionUrl = maleBaseUrl + `&regionCode=${region}`;
    await fetchMedia(
      maleRegionUrl,
      birdImage[Sex.MALE],
      "previewUrl",
      (item) => String(item.sex).toLowerCase() === Sex.MALE && item?.rating >= 4
    );
    if (birdImage[Sex.MALE].length < 10) {
      await fetchMedia(
        maleBaseUrl,
        birdImage[Sex.MALE],
        "previewUrl",
        (item) => String(item.sex).toLowerCase() === Sex.MALE
      );
    }

    // Fetch female images
    const femaleBaseUrl = `https://search.macaulaylibrary.org/api/v1/search?taxonCode=${id}&sex=female&mediaType=photo&sort=rating_rank_desc&limit=10`;
    const femaleRegionUrl = femaleBaseUrl + `&regionCode=${region}`;
    await fetchMedia(
      femaleRegionUrl,
      birdImage[Sex.FEMALE],
      "previewUrl",
      (item) =>
        String(item.sex).toLowerCase() === Sex.FEMALE && item?.rating >= 4
    );
    if (birdImage[Sex.FEMALE].length < 10) {
      await fetchMedia(
        femaleBaseUrl,
        birdImage[Sex.FEMALE],
        "previewUrl",
        (item) => String(item.sex).toLowerCase() === Sex.FEMALE
      );
    }

    // Save to Firebase
    try {
      await set(dbRef, birdImage);
      // console.log("Saved image data to Firebase for id:", id);
    } catch (error) {
      console.error("Error saving to Firebase:", error);
    }

    return birdImage;
  } catch (err) {
    console.error(err);
    return null;
  }
};
export const fetchImageAndAudioForMultiple = async (
  requestTimestamp: number,
  birdIds: string[],
  region: string,
  onProgress?: (originalTimestamp: number, progress: number) => void,
  onBuffer?: (originalTimestamp: number, newBuffer: number) => void
): Promise<DB_BIRBS> => {
  const MAX_CONCURRENT = 10;
  const results: DB_BIRBS = {};
  let completed = 0;
  let index = 0;

  async function worker() {
    while (index < birdIds.length) {
      // Use the current ID and move the pointer
      const currentId = birdIds[index];
      index++;
      if (onBuffer) onBuffer(requestTimestamp, (index / birdIds.length) * 100);

      // Wait before starting this request
      const [image, audio] = await Promise.all([
        fetchImageForOne(currentId, region),
        fetchAudioForOne(currentId, region),
      ]);
      results[currentId] = { image, audio };
      completed++;
      if (onProgress)
        onProgress(requestTimestamp, (completed / birdIds.length) * 100);
    }
  }

  // Start a pool of workers
  const workers = [];
  for (let i = 0; i < MAX_CONCURRENT; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);
  return results;
};

export const fetchImageAndAudioForMultiple1 = async (
  requestTimestamp: number,
  birdIds: string[],
  region: string,
  onProgress?: (originalTimestamp: number, progress: number) => void
): Promise<DB_BIRBS> => {
  const BATCH_SIZE = 10;
  const results: DB_BIRBS = {};
  const completed = { value: 0 };

  // helper declared outside of the loop to avoid closure issues
  const processBirdId = async (id: string): Promise<void> => {
    const [image, audio] = await Promise.all([
      fetchImageForOne(id, region),
      fetchAudioForOne(id, region),
    ]);
    results[id] = { image, audio };
    completed.value++;
    if (onProgress) {
      onProgress(requestTimestamp, (completed.value / birdIds.length) * 100);
    }
  };

  for (let i = 0; i < birdIds.length; i += BATCH_SIZE) {
    const batch = birdIds.slice(i, i + BATCH_SIZE);
    const promises = batch.map(processBirdId);
    await Promise.all(promises);
  }
  return results;
};

export type DB_BIRBS = Record<
  string,
  {
    image: BirdImage | null;
    audio: BirdAudio | null;
  }
>;

export type DB_LISTS = Record<string, DB_LIST>;

export type DB_LIST = {
  name: string;
  creator: string;
  favorite: FavoriteList;
  ids: string[];
  region: DBRegion;
};

export const arraysEqual = (a: string[], b: string[] = []) => {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
};

export const isValidEnumValue = <T extends object>(
  enumObj: T,
  value: any
): value is T[keyof T] => Object.values(enumObj).includes(value);
