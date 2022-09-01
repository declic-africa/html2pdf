module.exports = {
    validateUrl: (url) => {
        let isValid = false;
        let regexp = new RegExp(process.env.allowed_domain);
        let matches = regexp.exec(url);

        if (matches !== null && matches.length > 0 && url !== undefined) {
            isValid = true;
        }
        return isValid;
    }
}