/**
 * базовая функция для отправки запросов
 * @param url
 * @param options
 * @param isFormData
 * @returns {Promise<Response>}
 */
export const baseFetch = (url, options, isFormData) => {
    const token = localStorage.getItem('token')
    return fetch('http://localhost:8000/api' + url, {
        ...options,
        headers: {
            ...options?.headers,
            ...(token && {'Authorization': 'Bearer ' + token}),
            ...(!isFormData && {'Content-Type': 'application/json'}),
            Accept: 'application/json'
        }
    })
}

/**
 * Функция отправляющая запрос и обрабатывающая ответ
 * @param url
 * @param options
 * @param isFormData
 * @returns {Promise<{data: null, errors: null}>}
 */
export const appFetch = async (url, options, isFormData) => {
    const response = await baseFetch(url, options, isFormData);
    const result = await response.json().catch(() => null)

    let data = null
    let errors = null

    if (response.ok) {
        data = result
    } else {
        errors = result

        if (!errors.errors) {
            alert(errors.message)
        }
    }

    return {data, errors}
}

/**
 * Функция обрабатывающая логику отправки формы
 * @param func
 * @param errorsRef
 * @param onSuccess
 * @returns {Promise<void>}
 */
export const handleApiSubmit = async (func, errorsRef, onSuccess = () => null) => {
    const {data, errors} = await func()

    if (errors) {
        if (errors.errors) {
            errorsRef.value = errors.errors
            console.log(errorsRef.value)
        }

        return
    }

    await onSuccess?.(data)
}