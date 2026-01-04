/* eslint-disable camelcase */
import querystring from 'querystring'
import config from '~/nuxt.config'

const clientId = config.privateRuntimeConfig.spotifyClientId
const clientSecret = config.privateRuntimeConfig.spotifyClientSecret
const refreshToken = config.privateRuntimeConfig.spotifyRefreshToken

const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`

const getAccessToken = async () => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: querystring.stringify({
      grant_type: 'refresh_token',
      refreshToken,
    }),
  })

  return response.json()
}

const TOP_TRACKS_ENDPOINT = `https://api.spotify.com/v1/me/top/tracks`

export const getTopTracks = async () => {
  const { access_token } = await getAccessToken()

  return fetch(TOP_TRACKS_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
}
