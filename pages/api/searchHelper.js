export const SearchFilter = (data, value) => {
	return new Promise((resolve, reject) => {
		if (value !== "") {
			value = value.trim();
			var filterTable = [];
			var isMatch = 0;
			data.filter((o) => {
				isMatch = 0;
				Object.entries(o).forEach(([key, val]) => {
					if(val !== undefined && value !== undefined){
						if (isMatch === 0 && compareSearch(String(val).toLowerCase(), "*" + String(value).toLowerCase() + "*")) {
							filterTable.push(o);
							isMatch = 1;
						}
						return true;
					}
				});
				return true;
			});
			resolve(filterTable);
		} else {
			reject();
		}
	});
};

export const DateFilter = (data, startDate, endDate) => {
	return new Promise((resolve, reject) => {
        let resultProductData = data.filter((value) => {
			let date3 = value.date3;
			let date4 = value.date4;
			let sDate = new Date(date3);
			let eDate = new Date(date4);
			return sDate >= startDate && eDate <= endDate
        });
        resolve(resultProductData);
	})
}

const compareSearch = (str, rule) => {
	var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
};