export enum AudioType {
  CAll = "call",
  SONG = "song",
}

export const fetchAudio = async (id: string, audioType: AudioType) => {
  try {
    const response = await fetch(
      `https://search.macaulaylibrary.org/api/v1/search?taxonCode=${id}&tag=${audioType}&regionCode=na&mediaType=audio&sort=rating_rank_desc&limit=1`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const filteredData: string[] = data?.results?.content?.reduce(
      (acc: string[], item: any) => {
        if (
          String(item?.behaviors).toLowerCase() === audioType &&
          item.source === "ebird" &&
          item.mediaUrl
        ) {
          acc.push(item.mediaUrl);
        }
        return acc;
      },
      []
    );
    return filteredData;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const fetchImage = async (id: string) => {
  try {
    const response = await fetch(
      `https://search.macaulaylibrary.org/api/v1/search?taxonCode=${id}&regionCode=na&mediaType=photo&sort=rating_rank_desc&limit=1`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const filteredData: string[] = data?.results?.content?.reduce(
      (acc: string[], item: any) => {
        if (item.previewUrl) {
          acc.push(item.previewUrl);
        }
        return acc;
      },
      []
    );
    return filteredData;
  } catch (err) {
    console.log(err);
    return null;
  }
};
