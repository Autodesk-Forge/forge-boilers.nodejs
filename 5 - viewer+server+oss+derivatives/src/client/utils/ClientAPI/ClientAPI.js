
export default class ClientAPI {

  /////////////////////////////////////////////////////////////
  // constructor
  //
  /////////////////////////////////////////////////////////////
  constructor (apiUrl) {

    this.apiUrl = apiUrl
  }

  /////////////////////////////////////////////////////////////
  // fetch wrapper
  //
  /////////////////////////////////////////////////////////////
  fetch(url, params) {

    return fetch(url, params).then(response => {

      return response.json().then(json => {

        return response.ok ? json : Promise.reject(json);
      })
    })
  }

  /////////////////////////////////////////////////////////////
  // $.ajax wrapper
  //
  /////////////////////////////////////////////////////////////
  ajax (paramsOrUrl) {

    var params = {
      url: paramsOrUrl,
      rawBody: false,
      type: 'GET',
      data: null
    }

    if (typeof paramsOrUrl === 'object') {

      Object.assign(params, paramsOrUrl)
    }

    return new Promise((resolve, reject) => {

      Object.assign(params, {
        success: (response) => {

          if (paramsOrUrl.rawBody && response.body) {

            resolve (response.body)

          } else {

            resolve(response)
          }
        },
        error: function (error) {

          reject(error)
        }
      })

      $.ajax(params)
    })
  }

  /////////////////////////////////////////////////////////////
  // converts query object into query string
  //
  /////////////////////////////////////////////////////////////
  toQueryString (query) {

    if (!query) {
      return ''
    }

    const queryParams = Object.keys(query).map((key) => {
      return key + '=' + query[key]
    })

    return '?' + queryParams.join('&')
  }
}
