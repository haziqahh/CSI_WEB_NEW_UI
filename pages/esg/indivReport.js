import { Layout, Row, Col, Badge, Divider, Button } from "antd";
import Header from "./header";
import Footer from "../footer";
import APIHelpers from "../api/apiHelper";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ESGCalculation } from "../api/calculationHelper";
import { DIMENSION, MSIC, REPORTURL, WEBURL } from "../../compenents/config";
import { DownloadOutlined, DownOutlined, RightOutlined } from "@ant-design/icons";
import { multiRadarChart, radarChart } from "../../compenents/chart";

const { Content } = Layout;

function HomePage() {
  const router = useRouter();
  const [company, setCompany] = useState({});
  const [completedAssessment, setCompletedAssessment] = useState({});
  const [date, setDate] = useState("");
  const [score, setScore] = useState({});
  const [allScore, setAllScore] = useState({});
  const [summary, setSummary] = useState([]);
  const [learningResources, setLearningResources] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [fullCompany, setFullCompany] = useState([]);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [visibleDetails, setVisibleDetails] = useState(false);
  const [allAnswer, setAllAnswer] = useState([]);
  const [question, setQuestion] = useState({});
  const [overallAnswer, setOverallAnswer] = useState({});
  const [assessmentNo, setAssessmentNo] = useState(0);
  const [allDoc, setAllDoc] = useState([]);
  const [allDocName, setAllDocName] = useState([]);
  const [year, setYear] = useState("");

  useEffect(() => {
    if (router.isReady) {
      if (router.query.token) {
        sessionStorage.setItem("accessToken", router.query.token);
      }
      let date = new Date();
      setYear(date.getFullYear());
      date = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
      setDate(date);
      getAssessment();
      getLearningResource();
      getAllCompany();
    }
  }, [router.isReady]);

  useEffect(() => {
    if (Object.keys(completedAssessment).length > 0) {
      getCompany();
      getQuestion();
    }
  }, [completedAssessment]);

  useEffect(() => {
    if (Object.keys(score).length > 0 && learningResources.length > 0) {
      getRecommeded();
    }
  }, [score, learningResources]);

  useEffect(() => {
    if (Object.keys(company).length > 0 && fullCompany.length > 0 && Object.keys(score).length > 0) {
      getAllAssessment();
    }
  }, [company, fullCompany, score]);

  const getESGLevel = (value) => {
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

  const getQuestion = () => {
    APIHelpers.GET("v1/questions?questionSetId=" + completedAssessment.questionSetID)
      .then((res) => {
        let structure = new Object();
        let index = 0;
        res.items = res.items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        res.items.map((val, index1) => {
          if (val.questionType === "PSYCHOGRAPHIC" || val.questionType === "UPLOAD") {
            if (!(val.dimension in structure)) {
              structure[val.dimension] = [];
            }
            val.questionNo = index + 1;
            index += 1;
            structure[val.dimension].push(val);
          }
          if (index1 === res.items.length - 1) {
            setQuestion(structure);
          }
        });
      })
      .catch(() => {});
  };

  const getAssessment = () => {
    APIHelpers.GET("v1/assessments?id=" + router.query.id).then((res) => {
      let assessment = res.items[0];
      setAllDoc(assessment.isoDocs);
      let date = new Date(assessment.completionDate);
      assessment.formatCompletionDate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
      let validStart = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
      let validEnd = date;
      validEnd.setDate(validEnd.getDate() - 1);
      validEnd.setFullYear(validEnd.getFullYear() + 1);
      validEnd = ("0" + validEnd.getDate()).slice(-2) + "/" + ("0" + (validEnd.getMonth() + 1)).slice(-2) + "/" + validEnd.getFullYear();
      assessment.validityDate = validStart + " - " + validEnd;
      setCompletedAssessment(assessment);
      APIHelpers.GET("v1/assessmentEntries?assessmentId=" + assessment.id).then((res) => {
        if (res.items !== null) {
          let structure = [];
          let index = 0;
          let doc = [];
          res.items.map((val, index1) => {
            if (val.questionType === "PSYCHOGRAPHIC" || val.questionType === "UPLOAD") {
              val.questionNo = index + 1;
              index += 1;
              structure.push(val.questionType === "PSYCHOGRAPHIC" || (val.questionType === "UPLOAD" && val.question.options.length < 3) ? val.answer.scalar : val.answer.text);
            }
            if (val.questionType === "UPLOAD" && val.question.options.length > 2) {
              doc = [...doc, ...val.answer.text];
            }
            if (index1 === res.items.length - 1) {
              setAllDocName(doc);
              setAllAnswer(structure);
            }
          });
          console.log(res.items[0]);
          ESGCalculation(res.items)
            .then((score) => {
              setScore(score);
            })
            .catch(() => {});
        }
      });
    });
  };

  const getLearningResource = () => {
    APIHelpers.GET("v1/learningResources")
      .then((res) => {
        setLearningResources(res.items);
      })
      .catch(() => {});
  };

  const getAllCompany = () => {
    APIHelpers.GET("v1/smes")
      .then((res) => {
        let approved = [];
        res.items.map((val) => {
          if (val.approvedBy !== null) {
            approved.push(val.id);
          }
        });
        setFullCompany(approved);
      })
      .catch(() => {});
  };

  const getCompany = () => {
    APIHelpers.GET("v1/smes?id=" + completedAssessment.smeID)
      .then((res) => {
        let company = res.items[0];
        company.industry = MSIC.filter((item) => item.code === company.msic)[0].industryShort + " (" + company.msic + ")";
        setCompany(company);
      })
      .catch(() => {});
  };

  const getRecommeded = () => {
    let scoreRank = [];
    Object.keys(score).map((val) => {
      if (val !== "overall") {
        scoreRank.push({
          dimension: val === "Environmental" ? "Environment" : val,
          score: score[val],
        });
      }
    });
    scoreRank.sort((a, b) => a.score - b.score);
    let lowest = scoreRank.slice(0, 2);
    if (lowest[0].score === lowest[1].score || lowest[1].score === scoreRank[2].score) {
      lowest.push(scoreRank[2]);
    }
    if (lowest.length === 3) {
      if ((lowest[0].score === lowest[1].score && lowest[1].score === lowest[2].score) || (lowest[0].score === lowest[1].score && lowest[2].score === scoreRank[3].score) || (lowest[1].score === lowest[2].score && lowest[2].score === scoreRank[3].score)) {
        lowest.push(scoreRank[3]);
      }
    }
    lowest.push({
      dimension: "ESG",
      score: 0,
    });
    let resource = [];
    let random1 = 0;
    let random2 = 0;
    if (lowest.length === 3) {
      lowest.map((val) => {
        let list = learningResources.filter((item) => item.indicator === val.dimension);
        random1 = Math.floor(Math.random() * (list.length - 1));
        random2 = Math.floor(Math.random() * (list.length - 1));
        do {
          random2 = Math.floor(Math.random() * (list.length - 1));
        } while (random1 === random2);
        resource.push(list[random1]);
        resource.push(list[random2]);
      });
    } else if (lowest.length === 4) {
      lowest.map((val, index) => {
        let list = learningResources.filter((item) => item.indicator === val.dimension);
        random1 = Math.floor(Math.random() * (list.length - 1));
        resource.push(list[random1]);
        if (val.dimension === "ESG") {
          random2 = Math.floor(Math.random() * (list.length - 1));
          do {
            random2 = Math.floor(Math.random() * (list.length - 1));
          } while (random1 === random2);
          resource.push(list[random2]);
        } else {
          if (index === 0) {
            if (index !== lowest.length - 1) {
              if (val.score !== lowest[index + 1].score) {
                random2 = Math.floor(Math.random() * (list.length - 1));
                do {
                  random2 = Math.floor(Math.random() * (list.length - 1));
                } while (random1 === random2);
                resource.push(list[random2]);
              }
            }
          } else if (index !== 0 && index !== lowest.length - 1) {
            if (val.score !== lowest[index + 1].score && val.score !== lowest[index - 1].score) {
              random2 = Math.floor(Math.random() * (list.length - 1));
              do {
                random2 = Math.floor(Math.random() * (list.length - 1));
              } while (random1 === random2);
              resource.push(list[random2]);
            }
          } else if (index === lowest.length - 1) {
            if (val.score !== lowest[index - 1].score) {
              random2 = Math.floor(Math.random() * (list.length - 1));
              do {
                random2 = Math.floor(Math.random() * (list.length - 1));
              } while (random1 === random2);
              resource.push(list[random2]);
            }
          }
        }
      });
    } else if (lowest.length === 5) {
      lowest.map((val) => {
        let list = learningResources.filter((item) => item.indicator === val.dimension);
        random1 = Math.floor(Math.random() * (list.length - 1));
        resource.push(list[random1]);
        if (val.dimension === "ESG") {
          random2 = Math.floor(Math.random() * (list.length - 1));
          do {
            random2 = Math.floor(Math.random() * (list.length - 1));
          } while (random1 === random2);
          resource.push(list[random2]);
        }
      });
    }
    resource.sort((a, b) => a.title.localeCompare(b.title));
    setRecommended(resource);
  };

  const getAllAssessment = () => {
    APIHelpers.GET("v1/assessments")
      .then((res) => {
        if (res.items !== null) {
          let all = res.items.filter((item) => item.completionDate !== "0001-01-01T00:00:00Z" && fullCompany.includes(item.smeID));
          if (res.items.length > 1) {
            all = all.filter((item) => item.smeID !== company.id);
          }
          all = all.sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate));
          let companyId = [];
          let allObj = new Object();
          let allAnswer = new Object();
          if (all.length > 0) {
            setAssessmentNo(all.length);
            all.map((val, index) => {
              if (!companyId.includes(val.smeID)) {
                APIHelpers.GET("v1/assessmentEntries?assessmentId=" + val.id)
                  .then((res) => {
                    let scalarAnswer = res.items.filter((item) => item.questionType === "PSYCHOGRAPHIC" || (item.questionType === "UPLOAD" && item.question.options.length < 3));
                    scalarAnswer.map((val) => {
                      if (!(val.questionID in allAnswer)) {
                        allAnswer[val.questionID] = 0;
                      }
                      val.answer.scalar === true ? (allAnswer[val.questionID] += 1) : null;
                    });

                    ESGCalculation(res.items)
                      .then((result) => {
                        Object.keys(result).map((score) => {
                          if (score !== "overall") {
                            if (!(score in allObj)) {
                              allObj[score] = 0;
                            }
                            allObj[score] += result[score];
                          }
                        });
                        if (index === all.length - 1) {
                          Object.keys(allObj).map((score) => {
                            allObj[score] = Math.round(allObj[score] / all.length);
                          });
                          companyId.push(val.smeID);
                          setOverallAnswer(allAnswer);
                          setAllScore(allObj);
                          setSummary([
                            {
                              name: "Others",
                              data: [allObj["Environmental"], allObj["Governance"], allObj["Sustainable Procurement"], allObj["Social"]],
                            },
                            {
                              name: "Self",
                              data: [score["Environmental"], score["Governance"], score["Sustainable Procurement"], score["Social"]],
                            },
                          ]);
                        }
                      })
                      .catch(() => {});
                  })
                  .catch(() => {});
              }
            });
          }
        }
      })
      .catch(() => {});
  };

  const showQuestions = (value) => (
    <Row className="flex flex-col">
      <p className="font-semibold text-xl 1400:text-lg 820:text-base text-darkGreen my-4">{value}</p>
      {question[value].map((val) => (
        <div className="py-2 ml-2">
          <div className="flex gap-x-2">
            <p className="text-lg 1400:text-base 820:text-sm font-semibold mb-2">{val.questionNo}.</p>
            <p className="text-lg 1400:text-base 820:text-sm font-semibold mb-2">{val.questionLabel}</p>
          </div>
          {val.questionType === "PSYCHOGRAPHIC" || (val.questionType === "UPLOAD" && val.options.length < 3) ? (
            <p className="text-base 1400:text-sm 820:text-xs">
              Your Answer: <span className="font-bold">{allAnswer[val.questionNo - 1] === false ? "No" : "Yes"}</span>
            </p>
          ) : (
            <div>
              <p className="text-base 1400:text-sm 820:text-xs">Your Answer:</p>
              {allAnswer[val.questionNo - 1].length > 0 ? allAnswer[val.questionNo - 1].map((val1) => <p className="font-bold">{val1}</p>) : <p className="font-bold">None</p>}
            </div>
          )}
          {val.questionType === "PSYCHOGRAPHIC" || (val.questionType === "UPLOAD" && val.options.length < 3) ? (
            <div className="flex gap-x-4">
              <p className="text-base 1400:text-sm 820:text-xs">Your Peers:</p>
              <p className="text-base 1400:text-sm 820:text-xs">YES {overallAnswer[val.id] !== 0 ? Math.round((overallAnswer[val.id] / assessmentNo) * 100) : 0}%</p>
              <p className="text-base 1400:text-sm 820:text-xs">NO {assessmentNo - overallAnswer[val.id] !== 0 ? Math.round(((assessmentNo - overallAnswer[val.id]) / assessmentNo) * 100) : 0}%</p>
            </div>
          ) : null}
        </div>
      ))}
    </Row>
  );

  return (
    <Layout className="min-h-full">
      <Header></Header>
      <Content className="bg-white px-12 min-h-9/10 w-full pb-16">
        <Row className="mt-8 min-h-8/10 gap-x-8 w-3/5 1400:w-4/5 820:w-full mx-auto">
          <Row className="flex justify-end gap-x-8 w-full font-semibold relative">
            <Button
              className="flex items-center bg-smeBgColor font-semibold text-white hover:bg-smeBgColor focus:bg-smeBgColor hover:text-white focus:text-white px-4 py-2 mb-4"
              loading={downloadLoading}
              onClick={() => {
                setDownloadLoading(true);
                let data = REPORTURL + "/esg?target=" + WEBURL + "/esg/indivPdf?id=" + router.query.id + "&accessToken=" + sessionStorage.getItem("accessToken") + "&role=sme";
                let req = new XMLHttpRequest();
                req.open("GET", data, true);
                req.responseType = "blob";
                req.onload = function () {
                  //Convert the Byte Data to BLOB object.
                  let blob = new Blob([req.response], { type: "application/octetstream" });
                  //Check the Browser type and download the File.
                  let isIE = false || !!document.documentMode;
                  if (isIE) {
                    window.navigator.msSaveBlob(blob, company.companyName + ".pdf");
                  } else {
                    let url = window.URL || window.webkitURL;
                    let link = url.createObjectURL(blob);
                    let a = document.createElement("a");
                    a.setAttribute("download", company.companyName + ".pdf");
                    a.target = "_blank";
                    a.setAttribute("href", link);
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setDownloadLoading(false);
                  }
                };
                req.send();
              }}
            >
              {downloadLoading === false ? <DownloadOutlined /> : null}Download
            </Button>
          </Row>
          <Row className="w-full flex flex-col">
            <p className="text-darkGreen font-bold text-4xl 1400:text-3xl 820:text-2xl">ESG Assessment Report</p>
            {/* <p className="text-darkGreen text-3xl 1400:text-2xl 820:text-xl mt-2">{company?.companyName + " (" + company?.ssmNumber + ")"}</p> */}
          </Row>
          <Row className="w-full mt-4 flex justify-between">
            <Col className="w-1/2 bg-darkTeal text-white text-base px-4 pb-8 pt-2">
              <Row className="bg-white text-darkTeal p-8 -ml-8 border-darkTeal border-4 flex flex-col">
                <Col>
                  <p className="text-xl 1400:text-lg 820:text-base">Overall ESG Score</p>
                </Col>
                <Col>
                  <p className="text-3xl 1400:text-2xl 820:text-xl mt-4 font-bold">
                    {score["overall"] + "%"}&emsp;{getESGLevel(score["overall"])}
                  </p>
                </Col>
              </Row>
              <Row className="w-full mt-4">
                <p className="w-1/5">Company</p>:<p className="w-3/4 break-words ml-2">{Object.keys(company).length > 0 ? company.companyName : ""}</p>
              </Row>
              <Row className="w-full mt-2">
                <p className="w-1/5">Industry</p>:<p className="w-3/4 break-words ml-2">{Object.keys(company).length > 0 ? company.industry : ""}</p>
              </Row>
              <Row className="w-full mt-2">
                <p className="w-1/5">Assessment Date</p>:<p className="w-3/4 break-words ml-2">{Object.keys(completedAssessment).length > 0 ? completedAssessment.formatCompletionDate : ""}</p>
              </Row>
              <Row className="w-full mt-2">
                <p className="w-1/5">Report Validity</p>:<p className="w-3/4 break-words ml-2">{Object.keys(completedAssessment).length > 0 ? completedAssessment.validityDate : ""}</p>
              </Row>
            </Col>
            <Col className="w-2/5 bg-darkTeal text-white text-base px-4 pb-8 pt-2">
              <Row className="bg-white text-darkTeal px-8 py-5 -ml-8 border-darkTeal border-4 flex items-center justify-between">
                <p className="text-2xl 1400:text-xl 820:text-lg w-1/3">Environment</p>
                <p className="text-3xl 1400:text-xl 820:text-lg font-bold w-1/3 text-center">{score["Environmental"] + "%"}</p>
                <p className="text-3xl 1400:text-xl 820:text-lg font-bold w-1/3">{getESGLevel(score["Environmental"])}</p>
              </Row>
              <Row className="bg-white text-darkTeal px-8 py-5 -ml-8 border-darkTeal border-4 flex items-center justify-between mt-2">
                <p className="text-2xl 1400:text-xl 820:text-lg w-1/3">Social</p>
                <p className="text-3xl 1400:text-xl 820:text-lg font-bold w-1/3 text-center">{score["Social"] + "%"}</p>
                <p className="text-3xl 1400:text-xl 820:text-lg font-bold w-1/3">{getESGLevel(score["Social"])}</p>
              </Row>
              <Row className="bg-white text-darkTeal px-8 py-5 -ml-8 border-darkTeal border-4 flex items-center justify-between mt-2">
                <p className="text-2xl 1400:text-xl 820:text-lg w-1/3">Governance</p>
                <p className="text-3xl 1400:text-xl 820:text-lg font-bold w-1/3 text-center">{score["Governance"] + "%"}</p>
                <p className="text-3xl 1400:text-xl 820:text-lg font-bold w-1/3">{getESGLevel(score["Governance"])}</p>
              </Row>
              <Row className="bg-white text-darkTeal px-8 py-2 -ml-8 border-darkTeal border-4 flex items-center justify-between mt-2">
                <p className="text-2xl 1400:text-xl 820:text-lg w-1/3">
                  Sustainable
                  <br />
                  Procurement
                </p>
                <p className="text-3xl 1400:text-xl 820:text-lg font-bold w-1/3 text-center">{score["Sustainable Procurement"] + "%"}</p>
                <p className="text-3xl 1400:text-xl 820:text-lg font-bold w-1/3">{getESGLevel(score["Sustainable Procurement"])}</p>
              </Row>
            </Col>
          </Row>
          <Row className="w-full flex justify-between mt-8">
            <Col className="w-47%">
              <p className="text-darkGreen font-bold text-2xl 1400:text-xl 820:text-lg mt-8 mb-4">Recommended Learning Resources For {company?.companyName}</p>
              {recommended.length > 0
                ? recommended.map((val, index) => (
                    <a className={"flex items-center gap-x-4 rounded-full px-4 py-2 text-lg 1400:text-xl 820:text-lg text-white hover:text-white focus:text-white border-2 border-gray-300 bg-darkTeal mt-2"} href={val.link} target="_blank">
                      <p className="bg-white rounded-full text-yellow-600 py-3 px-5 text-sm">{index + 1}</p>
                      <p className="text-sm 1000:text-base">{val.title}</p>
                    </a>
                  ))
                : null}
              <div className="mt-2">
                <a href="/esg/dashboard" className="text-blue-400 text-lg 1400:text-base 820:text-sm hover:underline focus:underline">
                  For more learning resources, click here
                </a>
              </div>
            </Col>
            <Col className="w-47%">
              <p className="text-darkGreen font-bold text-2xl 1400:text-xl 820:text-lg mt-8 mb-4">{company?.companyName} Comparison With Peers</p>
              {summary.length > 0 ? (
                <div className={window.screen.width > 1800 ? "flex justify-around" : ""}>
                  <div className="flex justify-center -mx-8 -mb-8 mt-2">{multiRadarChart(summary, window.screen.width * 0.3)}</div>
                  <div className={window.screen.width > 1800 ? "flex flex-col gap-y-4 justify-center" : "flex flex-col gap-y-4 justify-center mt-6"}>
                    <Badge color="#008080" text={company.companyName}></Badge>
                    {/* <Badge color="#008080" text="Central for Sustainability Intelligence Sdn. Bhd."></Badge> */}
                    <Badge color="#22c55e" text="Other Companies"></Badge>
                  </div>
                </div>
              ) : null}
            </Col>
          </Row>
          <Row className="w-full flex flex-col mt-8">
            <p className="text-darkGreen font-bold text-2xl 1400:text-xl 820:text-lg mt-8 mb-4">Supporting Documents</p>
            {allDocName.length > 0
              ? allDocName.map((val, index) => (
                  <a
                    className={"flex items-center gap-x-4 px-4 py-2 text-2xl 1400:text-xl 820:text-lg text-white hover:text-white focus:text-white border-2 border-gray-300 bg-darkTeal mt-2"}
                    onClick={() => {
                      let data = WEBURL + "/storage/" + allDoc[index];
                      let fileName = allDoc[index].split("/").at(-1);
                      let req = new XMLHttpRequest();
                      req.open("GET", data, true);
                      req.responseType = "blob";
                      req.onload = function () {
                        //Convert the Byte Data to BLOB object.
                        let blob = new Blob([req.response], { type: "application/octetstream" });
                        //Check the Browser type and download the File.
                        let isIE = false || !!document.documentMode;
                        if (isIE) {
                          window.navigator.msSaveBlob(blob, fileName);
                        } else {
                          let url = window.URL || window.webkitURL;
                          let link = url.createObjectURL(blob);
                          let a = document.createElement("a");
                          a.setAttribute("download", fileName);
                          a.target = "_blank";
                          a.setAttribute("href", link);
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        }
                      };
                      req.send();
                    }}
                  >
                    <p className="text-sm 1000:text-base">{val}</p>
                  </a>
                ))
              : null}
          </Row>
          {Object.keys(company).length > 0 && Object.keys(allScore).length > 0 ? (
            <div className="my-8">
              <Row>
                <p className="text-darkGreen text-2xl 1400:text-xl 820:text-lg font-semibold">Summary</p>
              </Row>
              <Row className="w-full flex justify-between mt-2">
                <Col className="w-[24.5%] bg-darkTeal rounded-tr-3xl rounded-bl-3xl px-4 py-8 text-base text-white">
                  <p className="mb-4 font-semibold">Environmental</p>
                  <p>
                    {company?.companyName} scored {score["Environmental"] + "% (" + getESGLevel(score["Environmental"]) + ")"} in the Environmental Dimension which scores {Math.abs(score["Environmental"] - allScore?.Environmental) !== 0 ? Math.abs(score["Environmental"] - allScore?.Environmental) + "%" : null}{" "}
                    {score["Environmental"] - allScore?.Environmental > 0 ? "higher than" : score["Environmental"] - allScore?.Environmental < 0 ? "lower than" : "the same as"} its peers.
                  </p>
                </Col>
                <Col className="w-[24.5%] bg-darkTeal rounded-tl-3xl rounded-br-3xl px-4 py-8 text-base text-white">
                  <p className="mb-4 font-semibold">Social</p>
                  <p>
                    {company?.companyName} scored {score["Social"] + "% (" + getESGLevel(score["Social"]) + ")"} in the Social Dimension which scores {Math.abs(score["Social"] - allScore?.Social) !== 0 ? Math.abs(score["Social"] - allScore?.Social) + "%" : null} {score["Social"] - allScore?.Social > 0 ? "higher than" : score["Social"] - allScore?.Social < 0 ? "lower than" : "the same as"} its
                    peers.
                  </p>
                </Col>
                <Col className="w-[24.5%] bg-darkTeal rounded-tr-3xl rounded-bl-3xl px-4 py-8 text-base text-white">
                  <p className="mb-4 font-semibold">Governance</p>
                  <p>
                    {company?.companyName} scored {score["Governance"] + "% (" + getESGLevel(score["Governance"]) + ")"} in the Governance Dimension which scores {Math.abs(score["Governance"] - allScore?.Governance) !== 0 ? Math.abs(score["Governance"] - allScore?.Governance) + "%" : null}{" "}
                    {score["Governance"] - allScore?.Governance > 0 ? "higher than" : score["Governance"] - allScore?.Governance < 0 ? "lower than" : "the same as"} its peers.
                  </p>
                </Col>
                <Col className="w-[24.5%] bg-darkTeal rounded-tl-3xl rounded-br-3xl px-4 py-8 text-base text-white">
                  <p className="mb-4 font-semibold">Sustainable Procurement</p>
                  <p>
                    {company?.companyName} scored {score["Sustainable Procurement"] + "% (" + getESGLevel(score["Sustainable Procurement"]) + ")"} in the Sustainable Procurement Dimension which scores {Math.abs(score["Sustainable Procurement"] - allScore?.["Sustainable Procurement"]) !== 0 ? Math.abs(score["Sustainable Procurement"] - allScore?.["Sustainable Procurement"]) + "%" : null}{" "}
                    {score["Sustainable Procurement"] - allScore?.["Sustainable Procurement"] > 0 ? "higher than" : score["Sustainable Procurement"] - allScore?.["Sustainable Procurement"] < 0 ? "lower than" : "the same as"} its peers.
                  </p>
                </Col>
              </Row>
              <Row className="mt-2">
                {" "}
                <Col className="w-full bg-darkTeal rounded-tl-3xl rounded-br-3xl px-4 py-8 text-white text-base">
                  <p>
                    Overall {company?.companyName} garnered an ESG Maturity Score of {Math.round(score["overall"])}%, which is a {getESGLevel(score["overall"])} rating.
                  </p>
                </Col>
              </Row>
            </div>
          ) : null}
          <Row className="flex flex-col">
            <div className="flex items-center mt-8 gap-x-2 cursor-pointer" onClick={() => (visibleDetails === true ? setVisibleDetails(false) : setVisibleDetails(true))}>
              {visibleDetails === false ? <RightOutlined className="text-2xl 1400:text-xl 820:text-lg text-darkGreen" /> : <DownOutlined className="text-2xl 1400:text-xl 820:text-lg text-darkGreen" />}
              <p className="text-darkGreen font-semibold text-2xl 1400:text-xl 820:text-lg">View Details</p>
            </div>
            {visibleDetails === true ? (Object.keys(allAnswer).length > 0 ? DIMENSION.map((val) => showQuestions(val)) : null) : null}
          </Row>
          <Row className="w-full justify-end text-darkTeal mt-8">
            <p>
              Report Generated: {date}&emsp;ESG Report Assessment ID: {completedAssessment.serialNo}
            </p>
          </Row>
          <Divider className="border-black mt-0" />
          <Row>
            <p className="font-medium text-justify mt-2 text-darkTeal">
              {year} Centre For Sustainability Intelligence Sdn Bhd. CSI is not responsible for any errors of omissions, or for the results obtained from the use of this information. All information in this site is provided “as is ” with no guarantee of completeness, accuracy timeliness or of the results obtained from the use of this information and without warranty of any kind, express or
              implied, including, but not limited to warranties of performance, merchantability and fitness for a particular purpose. In no event will CSI, its related partnerships and corporations, or the directors, agents or employees thereof be liable to you or anyone else for any decision made or action taken in reliance on the information in this Report or any consequential, special or
              similar damages, even if advised or possibilities of such damages.
            </p>
          </Row>
        </Row>
      </Content>
      <Footer />
    </Layout>
  );
}

export default HomePage;
