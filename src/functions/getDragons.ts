type userFetchJson = {
  errors: any[],
  dragons: {
    [key: string]: {
      hoursleft: number
    }
  },
  data: {
    hasNextPage: boolean,
    endCursor: string
  }
}

async function getDragons(scrollName: string): Promise<{
  success: boolean,
  dragonCount: number,
  growingCount: number,
  dragonIds: string[]
}> {
  const startTime = performance.now();
  const FETCH_URL = 'https://dragcave.net/api/v2/user?limit=1000&username=' + scrollName;
  const FETCH_OPT = {
    headers: {
      Authorization: `Bearer ${process.env.DC_API_KEY}`
    }
  }
  const DRAGONS = {
    success: true,
    dragonCount: 0,
    growingCount: 0,
    dragonIds: [] as string[]
  }

  if (process.env.DC_API_KEY === undefined)
    throw new Error('API key is missing.');

  const response = await fetch(FETCH_URL, FETCH_OPT);

  if (!response.ok) {
    console.error(response.statusText);
    return { ...DRAGONS, success: false }
  }

  const json = (await response.json()) as userFetchJson

  if (json.errors.length > 0) {
    console.error(json.errors);
    return { ...DRAGONS, success: false }
  }

  // gather dragon total
  let hasNextPage = json.data.hasNextPage;
  let endCursor = json.data.endCursor;
  DRAGONS.dragonCount += Object.keys((json as userFetchJson).dragons).length;
  while (hasNextPage) {
    // it would not let me do this with async.
    // what does "Body is unusable" even mean?
    await fetch(FETCH_URL + '&after=' + endCursor, FETCH_OPT)
      .then(pageResponse => pageResponse.json())
      .then(pageJson => {
        hasNextPage = (pageJson as userFetchJson).data.hasNextPage;
        endCursor = (pageJson as userFetchJson).data.endCursor ?? '';
        DRAGONS.dragonCount += Object.keys((pageJson as userFetchJson).dragons).length;
      })
  }
  // rest of the stats
  DRAGONS.dragonIds = Object.keys(json.dragons).filter(key => {
    return (json.dragons[key].hoursleft) > 0;
  });
  DRAGONS.growingCount = DRAGONS.dragonIds.length;

  const endTime = performance.now();
  console.log(`DC fetch completed in ${endTime - startTime}ms`)
  return DRAGONS;
}

export default getDragons;