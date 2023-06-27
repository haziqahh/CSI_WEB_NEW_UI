import APIHelpers from "./apiHelper";

export const SignedUrl = (value) => {
    return new Promise((resolve, reject) => {
        let data = {
            path: value
        }
        APIHelpers.POST("v1/signedURL", data)
        .then((res) => {
            let link = document.createElement("a")
            link.target = "_blank"
            link.href = res.item
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        })
        .catch(() => {
            reject()
        })
    })
}

export const LogoSignedUrl = (value) => {
    return new Promise((resolve, reject) => {
        let data = {
            path: value
        }
        APIHelpers.POST("v1/signedURL", data)
        .then((res) => {
            resolve(res.item);
        })
        .catch(() => {
            reject()
        })
    })
}