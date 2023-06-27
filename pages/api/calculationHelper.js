export const IndexCalculation = (data) => {
  return new Promise((resolve, reject) => {
    let answer = data.filter((item) => item.questionType === "PSYCHOGRAPHIC" || item.questionType === "UPLOAD");
    let assessment = new Object();
    let score = new Object();
    let total = 0;
    answer.map((val) => {
      let question = val.question;
      if (!(question.dimension in assessment)) {
        assessment[question.dimension] = []
      }
      if (!(question.dimension in score)) {
        score[question.dimension] = 0
      }
      assessment[question.dimension].push(val);
    });
    Object.keys(assessment).map((dimension) => {
      assessment[dimension].map((ans, index) => {
        if(ans.questionType !== "UPLOAD") {
          if(ans.answer.scalar === true) {
            score[dimension] += 1
          }
        } else {
          if(ans.answer.text !== null) {
            score[dimension] += 1
          }
        }
        if(index === assessment[dimension].length - 1){
          score[dimension] = Math.round(score[dimension] / assessment[dimension].length * 100)
        }
      });
    });
    Object.keys(score).map((scoring) => {
      total += score[scoring]
    })
    total = total / Object.keys(score).length;
    resolve(Math.round(total));
  });
};

export const ESGCalculation = (data) => {
  return new Promise((resolve, reject) => {
    let answer = data.filter((item) => item.questionType === "PSYCHOGRAPHIC" || item.questionType === "UPLOAD");
    let assessment = new Object();
    let score = new Object();
    let total = 0;
    answer.map((val) => {
      let question = val.question;
      if (!(question.dimension in assessment)) {
        assessment[question.dimension] = []
      }
      if (!(question.dimension in score)) {
        score[question.dimension] = 0
      }
      assessment[question.dimension].push(val);
    });
    Object.keys(assessment).map((dimension) => {
      assessment[dimension].map((ans, index) => {
        if(ans.questionType !== "UPLOAD") {
          if(ans.answer.scalar === true) {
            score[dimension] += 1
          }
        } else {
          if(ans.answer.text !== null) {
            score[dimension] += 1
          }
        }
        if(index === assessment[dimension].length - 1){
          score[dimension] = Math.round(score[dimension] / assessment[dimension].length * 100)
        }
      });
    });
    Object.keys(score).map((scoring) => {
      total += score[scoring]
    })
    total = total / Object.keys(score).length;
    score["overall"] = Math.round(total)
    resolve(score);
  });
};

export const ESGLevel = (value) => {
  return new Promise((resolve, reject) => {
    if (value >= 0 && value < 25) {
      resolve("Beginner");
    } else if (value >= 25 && value < 45) {
      resolve("Fair");
    } else if (value >= 45 && value < 65) {
      resolve("Good");
    } else if (value >= 65 && value < 85) {
      resolve("Progressive");
    } else if (value >= 85 && value <= 100) {
      resolve("Exceptional");
    }
  });
};


export const getESGLevel = (value) => {
  if (value >= 0 && value < 25) {
    return "Beginner";
  } else if (value >= 25 && value < 45) {
    return "Fair";
  } else if (value >= 45 && value < 65) {
    return "Good";
  } else if (value >= 65 && value < 85) {
    return "Progressive";
  } else if (value >= 85 && value <= 100) {
    return "Exceptional";
  }
};