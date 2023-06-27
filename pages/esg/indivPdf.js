import { Layout, Row, Col, Badge, Divider, Button } from "antd";
import APIHelpers from "../api/apiHelper";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ESGCalculation } from "../api/calculationHelper";
import { DIMENSION, MSIC, REPORTURL, WEBURL } from "../../compenents/config";
import SmeLogo from "../../assests/logo/csiOri.png";
import { multiRadarChart } from "../../compenents/chart";

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

  const getAssessment = () => {
    APIHelpers.GET("v1/assessments?id=" + router.query.id).then((res) => {
      let assessment = res.items[0];
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
          let doc = [];
          res.items.map((val, index1) => {
            if (val.questionType === "UPLOAD" && val.question.options.length > 2) {
              doc = [...doc, ...val.answer.text];
            }
            if (index1 === res.items.length - 1) {
              setAllDocName(doc);
            }
          });
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
          if (all.length > 0) {
            all.map((val, index) => {
              if (!companyId.includes(val.smeID)) {
                APIHelpers.GET("v1/assessmentEntries?assessmentId=" + val.id)
                  .then((res) => {
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
                          // allObj["Sustainable Procurement"] = 50;
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

  return (
    <Layout className="min-h-full">
      <Content className="bg-white px-12 min-h-9/10 w-full">
        <Row className="mt-8 min-h-8/10 gap-x-8 w-full">
          <div className="h-1500px w-full">
            <Row className="w-full flex justify-between">
              <div className="flex flex-col">
                <p className="text-darkGreen font-bold text-4xl">ESG Assessment Report</p>
                {/* <p className="text-darkGreen text-2xl mt-2">{company?.companyName + " (" + company?.ssmNumber + ")"}</p> */}
              </div>
              <img src={SmeLogo.src} width={300} />
            </Row>
            <Row className="w-full mt-4 flex justify-between">
              <Col className="w-1/2 bg-darkTeal text-white px-4 pb-8 pt-2 text-lg">
                <Row className="bg-white text-darkTeal p-8 -ml-8 border-darkTeal border-4 flex flex-col">
                  <Col>
                    <p className="text-2xl">Overall ESG Score</p>
                  </Col>
                  <Col>
                    <p className="text-3xl mt-4 font-bold">
                      {score["overall"] + "%"}&emsp;{getESGLevel(score["overall"])}
                    </p>
                  </Col>
                </Row>
                <Row className="w-full mt-4">
                  <p className="w-2/5">Company</p>:<p className="w-2/4 break-words ml-2">{Object.keys(company).length > 0 ? company.companyName : ""}</p>
                </Row>
                <Row className="w-full mt-2">
                  <p className="w-2/5">Industry</p>:<p className="w-2/4 break-words ml-2">{Object.keys(company).length > 0 ? company.industry : ""}</p>
                </Row>
                <Row className="w-full mt-2">
                  <p className="w-2/5">Assessment Date</p>:<p className="w-2/4 break-words ml-2">{Object.keys(completedAssessment).length > 0 ? completedAssessment.formatCompletionDate : ""}</p>
                </Row>
                <Row className="w-full mt-2">
                  <p className="w-2/5">Report Validity</p>:<p className="w-2/4 break-words ml-2">{Object.keys(completedAssessment).length > 0 ? completedAssessment.validityDate : ""}</p>
                </Row>
              </Col>
              <Col className="w-2/5 bg-darkTeal text-white text-lg px-4 pb-8 pt-2">
                <Row className="bg-white text-darkTeal px-8 py-5 -ml-8 border-darkTeal border-4 flex items-center justify-between">
                  <p className="text-xl w-1/3">Environment</p>
                  <p className="text-2xl font-bold w-1/4 text-right">{score["Environmental"] + "%"}</p>
                  <p className="text-2xl font-bold w-1/4 mr-4">{getESGLevel(score["Environmental"])}</p>
                </Row>
                <Row className="bg-white text-darkTeal px-8 py-5 -ml-8 border-darkTeal border-4 flex items-center justify-between mt-2">
                  <p className="text-xl w-1/3">Social</p>
                  <p className="text-2xl font-bold w-1/4 text-right">{score["Social"] + "%"}</p>
                  <p className="text-2xl font-bold w-1/4 mr-4">{getESGLevel(score["Social"])}</p>
                </Row>
                <Row className="bg-white text-darkTeal px-8 py-5 -ml-8 border-darkTeal border-4 flex items-center justify-between mt-2">
                  <p className="text-xl w-1/3">Governance</p>
                  <p className="text-2xl font-bold w-1/4 text-right">{score["Governance"] + "%"}</p>
                  <p className="text-2xl font-bold w-1/4 mr-4">{getESGLevel(score["Governance"])}</p>
                </Row>
                <Row className="bg-white text-darkTeal px-8 py-2 -ml-8 border-darkTeal border-4 flex items-center justify-between mt-2">
                  <p className="text-xl w-1/3">
                    Sustainable
                    <br />
                    Procurement
                  </p>
                  <p className="text-2xl font-bold w-1/4 text-right">{score["Sustainable Procurement"] + "%"}</p>
                  <p className="text-2xl font-bold w-1/4 mr-4">{getESGLevel(score["Sustainable Procurement"])}</p>
                </Row>
              </Col>
            </Row>
            <Row className="w-full flex justify-between">
              <Col className="w-47%">
                <p className="text-darkGreen font-bold text-xl mt-8 mb-4">Recommended Learning Resources For {company?.companyName}</p>
                {recommended.length > 0
                  ? recommended.map((val, index) => (
                      <div className={"flex items-center gap-x-4 rounded-full px-4 py-2 text-lg text-white hover:text-white focus:text-white border-2 border-gray-300 bg-darkTeal mt-2"}>
                        <p className="bg-white rounded-full text-yellow-600 py-4 px-6 text-lg">{index + 1}</p>
                        <p>{val.title}</p>
                      </div>
                    ))
                  : null}
              </Col>
              <Col className="w-47%">
                <p className="text-darkGreen font-bold text-xl mt-8 mb-4">{company?.companyName} Comparison With Peers</p>
                <div className="flex justify-center -my-4">{summary.length > 0 ? multiRadarChart(summary, 600) : null}</div>
                <div className="flex gap-x-8 justify-center">
                  <Badge color="#008080" text={<span className="text-darkGreen">{company.companyName}</span>}></Badge>
                  <Badge color="#22c55e" text={<span className="text-darkGreen">Other Companies</span>}></Badge>
                </div>
              </Col>
            </Row>
            {Object.keys(company).length > 0 && Object.keys(allScore).length > 0 ? (
              <div className="my-8">
                <Row>
                  <p className="text-darkGreen text-xl font-semibold">Summary</p>
                </Row>
                <Row className="w-full flex justify-between mt-2">
                  <Col className="w-[24.5%] bg-darkTeal rounded-tr-3xl rounded-bl-3xl px-4 py-8 text-white text-lg">
                    <p className="mb-4 font-semibold">Environmental</p>
                    <p>
                      {company?.companyName} scored {score["Environmental"] + "% (" + getESGLevel(score["Environmental"]) + ")"} in the Environmental Dimension which scores {Math.abs(score["Environmental"] - allScore?.Environmental) !== 0 ? Math.abs(score["Environmental"] - allScore?.Environmental) + "%" : null}{" "}
                      {score["Environmental"] - allScore?.Environmental > 0 ? "higher than" : score["Environmental"] - allScore?.Environmental < 0 ? "lower than" : "the same as"} its peers.
                    </p>
                  </Col>
                  <Col className="w-[24.5%] bg-darkTeal rounded-tl-3xl rounded-br-3xl px-4 py-8 text-white text-lg">
                    <p className="mb-4 font-semibold">Social</p>
                    <p>
                      {company?.companyName} scored {score["Social"] + "% (" + getESGLevel(score["Social"]) + ")"} in the Social Dimension which scores {Math.abs(score["Social"] - allScore?.Social) !== 0 ? Math.abs(score["Social"] - allScore?.Social) + "%" : null} {score["Social"] - allScore?.Social > 0 ? "higher than" : score["Social"] - allScore?.Social < 0 ? "lower than" : "the same as"} its
                      peers.
                    </p>
                  </Col>
                  <Col className="w-[24.5%] bg-darkTeal rounded-tr-3xl rounded-bl-3xl px-4 py-8 text-white text-lg">
                    <p className="mb-4 font-semibold">Governance</p>
                    <p>
                      {company?.companyName} scored {score["Governance"] + "% (" + getESGLevel(score["Governance"]) + ")"} in the Governance Dimension which scores {Math.abs(score["Governance"] - allScore?.Governance) !== 0 ? Math.abs(score["Governance"] - allScore?.Governance) + "%" : null}{" "}
                      {score["Governance"] - allScore?.Governance > 0 ? "higher than" : score["Governance"] - allScore?.Governance < 0 ? "lower than" : "the same as"} its peers.
                    </p>
                  </Col>
                  <Col className="w-[24.5%] bg-darkTeal rounded-tl-3xl rounded-br-3xl px-4 py-8 text-white text-lg">
                    <p className="mb-4 font-semibold">Sustainable Procurement</p>
                    <p>
                      {company?.companyName} scored {score["Sustainable Procurement"] + "% (" + getESGLevel(score["Sustainable Procurement"]) + ")"} in the Sustainable Procurement Dimension which scores {Math.abs(score["Sustainable Procurement"] - allScore?.["Sustainable Procurement"]) !== 0 ? Math.abs(score["Sustainable Procurement"] - allScore?.["Sustainable Procurement"]) + "%" : null}{" "}
                      {score["Sustainable Procurement"] - allScore?.["Sustainable Procurement"] > 0 ? "higher than" : score["Sustainable Procurement"] - allScore?.["Sustainable Procurement"] < 0 ? "lower than" : "the same as"} its peers.
                    </p>
                  </Col>
                </Row>
                <Row className="mt-2">
                  {" "}
                  <Col className="w-full bg-darkTeal rounded-tl-3xl rounded-br-3xl px-4 py-8 text-white text-lg">
                    <p>
                      Overall {company?.companyName} garnered an ESG Maturity Score of {Math.round(score["overall"])}%, which is a {getESGLevel(score["overall"])} rating.
                    </p>
                  </Col>
                </Row>
              </div>
            ) : null}
          </div>
          <Row className="w-full justify-end text-darkGreen mt-8">
            <p>
              Report Generated: {date}&emsp;ESG Report Assessment ID: {completedAssessment.serialNo}
            </p>
          </Row>
          <Divider className="border-black mt-0" />
          <Row>
            <p className="font-medium text-justify mt-2 text-darkGreen">
              {year} Centre For Sustainability Intelligence Sdn Bhd. CSI is not responsible for any errors of omissions, or for the results obtained from the use of this information. All information in this site is provided “as is ” with no guarantee of completeness, accuracy timeliness or of the results obtained from the use of this information and without warranty of any kind, express or
              implied, including, but not limited to warranties of performance, merchantability and fitness for a particular purpose. In no event will CSI, its related partnerships and corporations, or the directors, agents or employees thereof be liable to you or anyone else for any decision made or action taken in reliance on the information in this Report or any consequential, special or
              similar damages, even if advised or possibilities of such damages.
            </p>
          </Row>
        </Row>
        <Row className="h-[1550px] mt-20 flex flex-col">
          <p className="text-darkGreen font-bold text-3xl 1400:text-2xl 820:text-xl mt-8 mb-4">Supporting Documents</p>
          {allDocName.length > 0
            ? allDocName.map((val) => (
                <a className={"flex items-center gap-x-4 px-4 py-2 text-2xl 1400:text-xl 820:text-lg text-white hover:text-white focus:text-white border-2 bg-darkTeal mt-2"}>
                  <p>{val}</p>
                </a>
              ))
            : null}
        </Row>
        <Row className="w-full justify-end text-darkGreen mt-4">
          <p>
            Report Generated: {date}&emsp;ESG Report Assessment ID: {completedAssessment.serialNo}
          </p>
        </Row>
        <Divider className="border-black mt-0" />
        <Row>
          <p className="font-medium text-justify mt-2 text-darkGreen">
            {year} Centre For Sustainability Intelligence Sdn Bhd. CSI is not responsible for any errors of omissions, or for the results obtained from the use of this information. All information in this site is provided “as is ” with no guarantee of completeness, accuracy timeliness or of the results obtained from the use of this information and without warranty of any kind, express or implied,
            including, but not limited to warranties of performance, merchantability and fitness for a particular purpose. In no event will CSI, its related partnerships and corporations, or the directors, agents or employees thereof be liable to you or anyone else for any decision made or action taken in reliance on the information in this Report or any consequential, special or similar damages,
            even if advised or possibilities of such damages.
          </p>
        </Row>
      </Content>
    </Layout>
  );
}

export default HomePage;
