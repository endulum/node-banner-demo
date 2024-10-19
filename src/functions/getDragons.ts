async function getDragons(scrollName: string): Promise<string[]> {
  if (process.env.DC_API_KEY === undefined)
    throw new Error('Some critical env values are missing.');

  const response = await fetch('https://dragcave.net/api/v2/user?username=' + scrollName, {
    headers: {
      Authorization: `Bearer ${process.env.DC_API_KEY}`
    }
  });

  const json = (await response.json()) as {
    dragons: {
      [key: string]: {
        hoursleft: number
      }
    }
  }

  const dragonIds = Object.keys(json.dragons).filter(key => {
    return (json.dragons[key].hoursleft) > 0;
  })

  return dragonIds;
}

export default getDragons;