export function sliceString(string) {
    if (string.length < 300) {
        return string
    } else {
        for (let i = 300; i < string.length; i++) {
            if (string[i] === " ") {
                return string.slice(0, i) + "..."
            }
        }
        return string
    }
}

