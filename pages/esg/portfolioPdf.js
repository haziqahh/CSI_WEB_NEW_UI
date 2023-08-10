import { Layout, Row, Col, Badge, Divider, Button, Table, Tooltip } from "antd";
import APIHelpers from "../api/apiHelper";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ESGCalculation } from "../api/calculationHelper";
import { DIMENSION, MSIC, REPORTURL, WEBURL } from "../../compenents/config";
import {
  portfolioColumnChartTemp,
  portfolioDonutChartTemp,
} from "../../compenents/chart";
import SmeLogo from "../../assests/logo/csiOri.png";

const { Content } = Layout;
const { Column } = Table;
const COLORS = ["#4CB4B2", "#3D8F8F", "#1B786E", "#00717D", "#004B53"];
const SIXCOLORS = [
  "#53c9c7",
  "#4CB4B2",
  "#3D8F8F",
  "#1B786E",
  "#00717D",
  "#004B53",
];
const SCORELEVEL = ["Exceptional", "Progressive", "Good", "Fair", "Beginner"];

function HomePage() {
  const router = useRouter();
  const [company, setCompany] = useState({});
  const [date, setDate] = useState("");
  const [allAggScoreLength, setAllAggScoreLength] = useState(0);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [industryRank, setIndustryRank] = useState([]);
  const [industryBottomRank, setIndustryBottomRank] = useState([]);
  const [smeRank, setSmeRank] = useState([]);
  const [smeBottomRank, setSmeBottomRank] = useState([]);
  const [portfolioBranches, setPortfolioBranches] = useState([]);
  const [portfolioRevenue, setPortfolioRevenue] = useState([]);
  const [portfolioSize, setPortfolioSize] = useState([]);
  const [fullCompany, setFullCompany] = useState([]);
  const [reqConnection, setReqConnection] = useState([]);
  const [recConnection, setRecConnection] = useState([]);
  const [linkedCompany, setLinkCompany] = useState([]);
  const [linkedCompanyId, setLinkCompanyId] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);
  const [portfolioDataReady, setPortfolioDataReady] = useState(0);
  const [sharedAssessment, setSharedAssessment] = useState([]);
  const [allPortfolioScore, setAllPortfolioScore] = useState({});
  const [envRank, setEnvRank] = useState([]);
  const [socRank, setSocRank] = useState([]);
  const [govRank, setGovRank] = useState([]);
  const [susRank, setSusRank] = useState([]);
  const [overallRank, setOverallRank] = useState([]);
  const [summary, setSummary] = useState([]);
  const [stateRank, setStateRank] = useState([]);
  const [year, setYear] = useState("");
  const [footerYear, setFooterYear] = useState("");

  useEffect(() => {
    if (router.isReady) {
      if (router.query.token) {
        sessionStorage.setItem("accessToken", router.query.token);
      }
      let date = new Date();
      date =
        ("0" + date.getDate()).slice(-2) +
        "/" +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        "/" +
        date.getFullYear();
      if (router.query.quarter && router.query.year) {
        setFooterYear(router.query.year);
        if (router.query.quarter === "1") {
          date = "31/03/" + router.query.year;
          setYear(router.query.year + "-03-31T23:59:00Z");
        } else if (router.query.quarter === "2") {
          date = "30/06/" + router.query.year;
          setYear(router.query.year + "-06-30T23:59:00Z");
        } else if (router.query.quarter === "3") {
          date = "30/09/" + router.query.year;
          setYear(router.query.year + "-09-30T23:59:00Z");
        } else if (router.query.quarter === "4") {
          date = "31/12/" + router.query.year;
          setYear(router.query.year + "-12-31T23:59:00Z");
        }
      } else {
        setFooterYear(new Date().getFullYear());
      }
      setDate(date);
      getCompany();
    }
  }, [router.isReady]);

  useEffect(() => {
    if (Object.keys(company).length > 0) {
      getSME();
    }
  }, [company]);

  useEffect(() => {
    if (Object.keys(company).length > 0 && fullCompany.length > 0) {
      getReqConnections();
      getRecConnections();
    }
  }, [company, fullCompany]);

  useEffect(() => {
    if (reqConnection !== null || recConnection !== null) {
      let all = [];
      if (reqConnection !== null && recConnection === null) {
        all = reqConnection;
      } else if (reqConnection === null && recConnection !== null) {
        all = recConnection;
      } else {
        all = [].concat(reqConnection, recConnection);
      }
      let connection = [];
      let linked = [];
      all.map((val, index) => {
        let com = [];
        if (val.requestCompanyID !== company.id) {
          com = fullCompany.filter(
            (item) => item.id === val.requestCompanyID
          )[0];
        } else {
          com = fullCompany.filter(
            (item) => item.id === val.receivedCompanyID
          )[0];
        }
        let date = new Date(val.linkDate);
        date =
          ("0" + date.getDate()).slice(-2) +
          "/" +
          ("0" + (date.getMonth() + 1)).slice(-2) +
          "/" +
          date.getFullYear();
        connection.push({
          id: com.id,
          connectionId: val.id,
          companyName: com.companyName,
          ssmNumber: com.ssmNumber,
          industry: com.industry,
          linkDate: date,
          status: "ACTIVE",
        });
        linked.push(com.id);
        if (index === all.length - 1) {
          setLinkCompanyId(linked);
          setLinkCompany(connection);
        }
      });
    }
  }, [reqConnection, recConnection]);

  useEffect(() => {
    if (linkedCompanyId.length > 0 && Object.keys(company).length > 0) {
      getAllAssessment();
    }
  }, [linkedCompanyId, company]);

  useEffect(() => {
    if (portfolioData.length > 0 && portfolioDataReady === 1) {
      let data = portfolioData;
      let linked = [];
      data.map((val) => {
        if (val.sharedWiths !== null) {
          val.sharedWiths.map((share) => {
            if (share.corporateID === company.id && share.status === "ACTIVE") {
              linked.push(val);
            }
          });
        }
      });
      setAllAggScoreLength(linked.length);
      linked = linked.sort(
        (a, b) => new Date(b.completionDate) - new Date(a.completionDate)
      );
      let year = new Object();
      let smeId = [];
      let envRank = [0, 0, 0, 0, 0];
      let socRank = [0, 0, 0, 0, 0];
      let govRank = [0, 0, 0, 0, 0];
      let susRank = [0, 0, 0, 0, 0];
      let overallRank = [0, 0, 0, 0, 0];
      let envBreakdown = [];
      let socBreakdown = [];
      let govBreakdown = [];
      let susBreakdown = [];
      let overallBreakdown = [];
      linked.map((val, index) => {
        let reportYear = new Date(val.completionDate).getFullYear();
        let reportMonth = new Date(val.completionDate).getMonth() + 1;
        reportMonth = Math.ceil(reportMonth / 3);
        if (!(reportYear + "Q" + reportMonth in year)) {
          year[reportYear + "Q" + reportMonth] = [];
        }
        if (!smeId.includes(val.smeID)) {
          year[reportYear + "Q" + reportMonth].push(val);
          smeId.push(val.smeID);
        }
        if (val.Env >= 0 && val.Env < 25) {
          envRank[4] += 1;
        } else if (val.Env >= 25 && val.Env < 45) {
          envRank[3] += 1;
        } else if (val.Env >= 45 && val.Env < 65) {
          envRank[2] += 1;
        } else if (val.Env >= 65 && val.Env < 85) {
          envRank[1] += 1;
        } else if (val.Env >= 85 && val.Env <= 100) {
          envRank[0] += 1;
        }
        if (val.Soc >= 0 && val.Soc < 25) {
          socRank[4] += 1;
        } else if (val.Soc >= 25 && val.Soc < 45) {
          socRank[3] += 1;
        } else if (val.Soc >= 45 && val.Soc < 65) {
          socRank[2] += 1;
        } else if (val.Soc >= 65 && val.Soc < 85) {
          socRank[1] += 1;
        } else if (val.Soc >= 85 && val.Soc <= 100) {
          socRank[0] += 1;
        }
        if (val.Gov >= 0 && val.Gov < 25) {
          govRank[4] += 1;
        } else if (val.Gov >= 25 && val.Gov < 45) {
          govRank[3] += 1;
        } else if (val.Gov >= 45 && val.Gov < 65) {
          govRank[2] += 1;
        } else if (val.Gov >= 65 && val.Gov < 85) {
          govRank[1] += 1;
        } else if (val.Gov >= 85 && val.Gov <= 100) {
          govRank[0] += 1;
        }
        if (val.Sus >= 0 && val.Sus < 25) {
          susRank[4] += 1;
        } else if (val.Sus >= 25 && val.Sus < 45) {
          susRank[3] += 1;
        } else if (val.Sus >= 45 && val.Sus < 65) {
          susRank[2] += 1;
        } else if (val.Sus >= 65 && val.Sus < 85) {
          susRank[1] += 1;
        } else if (val.Sus >= 85 && val.Sus <= 100) {
          susRank[0] += 1;
        }
        if (val.score >= 0 && val.score < 25) {
          overallRank[4] += 1;
        } else if (val.score >= 25 && val.score < 45) {
          overallRank[3] += 1;
        } else if (val.score >= 45 && val.score < 65) {
          overallRank[2] += 1;
        } else if (val.score >= 65 && val.score < 85) {
          overallRank[1] += 1;
        } else if (val.score >= 85 && val.score <= 100) {
          overallRank[0] += 1;
        }
        val.industry = MSIC.filter(
          (item) => item.code === val.msic
        )[0].industryShort;
        if (index === linked.length - 1) {
          setTimeout(() => {
            setSmeRank(linked.sort((a, b) => b.score - a.score).slice(0, 10));
            if (linked.length > 10) {
              setSmeBottomRank(
                linked
                  .sort((a, b) => a.score - b.score)
                  .splice(0, 10)
                  .slice(0, 10)
              );
            }
            let industryObj = new Object();
            let industryRank = [];
            // let stateRank = new Object();
            let stateRank = new Object({
              Johor: 0,
              Kedah: 0,
              Kelantan: 0,
              Malacca: 0,
              "Negeri Sembilan": 0,
              Pahang: 0,
              "Pulau Pinang": 0,
              Perak: 0,
              Perlis: 0,
              Selangor: 0,
              Terengganu: 0,
              Sabah: 0,
              Sarawak: 0,
              "Wilayah Persekutuan Kuala Lumpur": 0,
              "Wilayah Persekutuan Labuan": 0,
              "Wilayah Persekutuan Putrajaya": 0,
            });
            linked.map((val, index) => {
              if (!(val.industry in industryObj)) {
                industryObj[val.industry] = {
                  env: 0,
                  soc: 0,
                  gov: 0,
                  sus: 0,
                  score: 0,
                  qty: 0,
                };
              }
              if (!(val.state in stateRank)) {
                stateRank[val.state] = 0;
              }
              stateRank[val.state] += 1;
              industryObj[val.industry].env += val.Env;
              industryObj[val.industry].soc += val.Soc;
              industryObj[val.industry].gov += val.Gov;
              industryObj[val.industry].sus += val.Sus;
              industryObj[val.industry].score += val.score;
              industryObj[val.industry].qty += 1;
              if (index === linked.length - 1) {
                setStateRank(stateRank);
                Object.keys(industryObj).map((val, industryIndex) => {
                  industryRank.push({
                    industry: val,
                    Env: Math.round(
                      industryObj[val].env / industryObj[val].qty
                    ),
                    Soc: Math.round(
                      industryObj[val].soc / industryObj[val].qty
                    ),
                    Gov: Math.round(
                      industryObj[val].gov / industryObj[val].qty
                    ),
                    Sus: Math.round(
                      industryObj[val].sus / industryObj[val].qty
                    ),
                    score: Math.round(
                      industryObj[val].score / industryObj[val].qty
                    ),
                    percentage: Math.round(
                      (industryObj[val].qty / linked.length) * 100
                    ),
                  });
                  if (industryIndex === Object.keys(industryObj).length - 1) {
                    setIndustryRank(
                      industryRank.sort((a, b) => b.score - a.score).slice(0, 5)
                    );
                    if (industryRank.length > 5) {
                      setIndustryBottomRank(
                        industryRank
                          .sort((a, b) => a.score - b.score)
                          .splice(0, 5)
                          .slice(0, 5)
                      );
                    }
                  }
                });
              }
            });
            setSummary([
              envRank.indexOf(Math.max.apply(null, envRank)),
              socRank.indexOf(Math.max.apply(null, socRank)),
              govRank.indexOf(Math.max.apply(null, govRank)),
              susRank.indexOf(Math.max.apply(null, susRank)),
              overallRank.indexOf(Math.max.apply(null, overallRank)),
            ]);
            envRank.map((val, index) => {
              envBreakdown.push(Math.round((val / linked.length) * 100));
              if (index === envRank.length - 1) {
                setEnvRank(envBreakdown);
              }
            });
            socRank.map((val, index) => {
              socBreakdown.push(Math.round((val / linked.length) * 100));
              if (index === socRank.length - 1) {
                setSocRank(socBreakdown);
              }
            });
            govRank.map((val, index) => {
              govBreakdown.push(Math.round((val / linked.length) * 100));
              if (index === govRank.length - 1) {
                setGovRank(govBreakdown);
              }
            });
            susRank.map((val, index) => {
              susBreakdown.push(Math.round((val / linked.length) * 100));
              if (index === susRank.length - 1) {
                setSusRank(susBreakdown);
              }
            });
            overallRank.map((val, index) => {
              overallBreakdown.push(Math.round((val / linked.length) * 100));
              if (index === overallRank.length - 1) {
                setOverallRank(overallBreakdown);
              }
            });
          }, 500);
        }
      });
      let portfolio = new Object();
      let totalEnv = 0;
      let totalSoc = 0;
      let totalGov = 0;
      let totalSus = 0;
      let totalScore = 0;
      let genAnswer = {
        Q1: [],
        Q2: [],
        Q3: [],
      };
      let initial = true;
      Object.keys(year).map((val, index) => {
        year[val].map((val1, index1) => {
          let yearValue = val.slice(0, 4);
          let quarter = val.slice(-1);
          if (quarter === "1") {
            quarter = "31 Mac";
          } else if (quarter === "2") {
            quarter = "30 Jun";
          } else if (quarter === "3") {
            quarter = "30 Sep";
          } else if (quarter === "4") {
            quarter = "31 Dec";
          }
          APIHelpers.GET("v1/assessmentEntries?assessmentId=" + val1.id)
            .then((res) => {
              let genQuestion = res.items.filter(
                (item) => item.questionType === "DEMOGRAPHIC"
              );
              if (initial === true) {
                genQuestion.map((gen, index) => {
                  gen.question.options.map((option, questionIndex) => {
                    genAnswer["Q" + (index + 1)][questionIndex] = {
                      name: option,
                      value: 0,
                    };
                  });
                });
                initial = false;
              }
              genQuestion.map((gen, index) => {
                let answer = gen.question.options.indexOf(gen.answer.text[0]);
                genAnswer["Q" + (index + 1)][answer].value += 1;
              });
              ESGCalculation(res.items)
                .then((res) => {
                  totalEnv += res["Environmental"];
                  totalSoc += res["Social"];
                  totalGov += res["Governance"];
                  totalSus += res["Sustainable Procurement"];
                  // totalSus += 50;
                  totalScore += res.overall;
                  if (index1 === year[val].length - 1) {
                    setPortfolioBranches(genAnswer.Q1);
                    setPortfolioRevenue(genAnswer.Q2);
                    setPortfolioSize(genAnswer.Q3);
                    setTimeout(() => {
                      portfolio = {
                        Env: Math.round(totalEnv / linked.length),
                        Soc: Math.round(totalSoc / linked.length),
                        Gov: Math.round(totalGov / linked.length),
                        Sus: Math.round(totalSus / linked.length),
                        score: Math.round(totalScore / linked.length),
                        year: yearValue,
                        quarter: val.slice(-1),
                      };
                      setAllPortfolioScore(portfolio);
                    }, 500);
                  }
                })
                .catch(() => {});
            })
            .catch(() => {});
        });
      });
    }
  }, [portfolioData, portfolioDataReady]);

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

  const getCompany = () => {
    APIHelpers.GET("v1/smes?id=" + router.query.id)
      .then((res) => {
        let company = res.items[0];
        company.industry =
          MSIC.filter((item) => item.code === company.msic)[0].industryShort +
          " (" +
          company.msic +
          ")";
        setCompany(company);
      })
      .catch(() => {});
  };

  const getSME = () => {
    APIHelpers.GET("v1/smes")
      .then((res) => {
        if (res.items) {
          let filter = res.items.filter(
            (item) => item.id !== company.id && !linkedCompany.includes(item.id)
          );
          filter.map((val) => {
            val.industry = MSIC.filter(
              (item) => item.code === val.msic
            )[0].industry;
          });
          setFullCompany(filter);
        }
      })
      .catch(() => {});
  };

  const getReqConnections = () => {
    APIHelpers.GET(
      "v1/connections?requestCompanyID=" + company.id + "&status=ACTIVE"
    )
      .then((res) => {
        setReqConnection(res.items);
      })
      .catch(() => {});
  };

  const getRecConnections = () => {
    APIHelpers.GET(
      "v1/connections?receivedCompanyID=" + company.id + "&status=ACTIVE"
    )
      .then((res) => {
        setRecConnection(res.items);
      })
      .catch(() => {});
  };

  const getAllAssessment = () => {
    APIHelpers.GET("v1/assessments")
      .then((res) => {
        let complete = [];
        if (year === "") {
          complete = res.items.filter(
            (item) =>
              linkedCompanyId.includes(item.smeID) &&
              item.completionDate !== "0001-01-01T00:00:00Z"
          );
        } else {
          complete = res.items.filter(
            (item) =>
              linkedCompanyId.includes(item.smeID) &&
              item.completionDate !== "0001-01-01T00:00:00Z" &&
              new Date(item.completionDate) <= new Date(year)
          );
        }
        // let complete = res.items.filter((item) => linkedCompanyId.includes(item.smeID) && item.completionDate !== "0001-01-01T00:00:00Z");
        // if (complete.length > 0) {
        //   setPortfolioDataReady(portfolioDataReady + 1);
        //   setPortfolioData(complete);
        // }
        complete = complete.sort(
          (a, b) => new Date(b.completionDate) - new Date(a.completionDate)
        );
        complete.map((val, index) => {
          APIHelpers.GET("v1/assessmentEntries?assessmentId=" + val.id)
            .then((res) => {
              ESGCalculation(res.items)
                .then((res) => {
                  let date = new Date(val.completionDate);
                  val.oriDate = date;
                  val.formatCompletionDate =
                    ("0" + date.getDate()).slice(-2) +
                    "/" +
                    ("0" + (date.getMonth() + 1)).slice(-2) +
                    "/" +
                    date.getFullYear();
                  let validStart =
                    ("0" + date.getDate()).slice(-2) +
                    "/" +
                    ("0" + (date.getMonth() + 1)).slice(-2) +
                    "/" +
                    date.getFullYear();
                  let validEnd = date;
                  validEnd.setDate(validEnd.getDate() - 1);
                  validEnd.setFullYear(validEnd.getFullYear() + 1);
                  validEnd =
                    ("0" + validEnd.getDate()).slice(-2) +
                    "/" +
                    ("0" + (validEnd.getMonth() + 1)).slice(-2) +
                    "/" +
                    validEnd.getFullYear();
                  val.validityDate = validStart + " - " + validEnd;
                  let smeCompany = fullCompany.filter(
                    (item) => item.id === val.smeID
                  )[0];
                  val.companyName = smeCompany.companyName;
                  val.state = smeCompany.state;
                  val.msic = smeCompany.msic;
                  val.industry = smeCompany.industry;
                  val.Env = Math.round(res.Environmental);
                  val.Soc = Math.round(res.Social);
                  val.Gov = Math.round(res.Governance);
                  val.Sus = Math.round(res["Sustainable Procurement"]);
                  // val.Sus = Math.round(50)
                  val.score = Math.round(res.overall);
                  val.shared = false;
                  if (val.sharedWiths !== null) {
                    if (
                      val.sharedWiths.filter(
                        (item) => item.corporateID === company.id
                      ).length > 0
                    ) {
                      let status = val.sharedWiths.filter(
                        (item) => item.corporateID === company.id
                      )[0].status;
                      if (status === "ACTIVE") {
                        val.shared = true;
                      }
                    }
                  }
                  if (index === complete.length - 1) {
                    setTimeout(() => {
                      if (complete.length > 0) {
                        setPortfolioDataReady(portfolioDataReady + 1);
                        setPortfolioData(complete);
                      }
                      setSharedAssessment(complete);
                    }, 1000);
                  }
                })
                .catch(() => {});
            })
            .catch(() => {});
        });
      })
      .catch(() => {});
  };

  const page1 = () => (
    <Row className="mt-8 min-h-8/10 w-full">
      <Row className="w-full flex justify-between">
        <div className="flex flex-col">
          <p className="text-darkGreen font-bold text-4xl">
            ESG Portfolio Report
          </p>
        </div>
        <img src={SmeLogo.src} width={300} />
      </Row>
      <Row className="w-full mt-4 flex justify-between">
        <Col className="w-1/2 bg-darkTeal text-white text-lg px-4 py-2">
          <Row className="bg-white text-darkTeal p-8 -ml-8 border-darkTeal border-4 flex flex-col">
            <Col>
              <p className="text-2xl">ESG Score</p>
            </Col>
            <Col>
              <p className="text-3xl font-bold mt-4">
                {allPortfolioScore.score + "%"}&emsp;
                {getESGLevel(allPortfolioScore.score)}
              </p>
            </Col>
          </Row>
          <Row className="w-full mt-4">
            <p className="w-2/5">Company</p>:
            <p className="w-2/4 break-words ml-2">
              {Object.keys(company).length > 0 ? company.companyName : ""}
            </p>
          </Row>
          <Row className="w-full mt-2">
            <p className="w-2/5">Industry</p>:
            <p className="w-2/4 break-words ml-2">
              {Object.keys(company).length > 0 ? company.industry : ""}
            </p>
          </Row>
          <Row className="w-full mt-2">
            <p className="w-2/5">Connection Size</p>:
            <p className="w-2/4 break-words ml-2">
              {linkedCompanyId.length + " connections"}
            </p>
          </Row>
          <Row className="w-full mt-2">
            <p className="w-2/5">Portfolio Size</p>:
            <p className="w-2/4 break-words ml-2">
              {allAggScoreLength + " reports"}
            </p>
          </Row>
        </Col>
        <Col className="w-2/5 bg-darkTeal text-white text-lg px-4 py-2">
          <Row className="bg-white text-darkTeal px-8 py-5 -ml-8 border-darkTeal border-4 flex items-center justify-between">
            <p className="text-xl w-1/3">Environment</p>
            <p className="text-2xl font-bold w-1/4 text-right">
              {allPortfolioScore.Env + "%"}
            </p>
            <p className="text-2xl font-bold w-1/4 mr-4">
              {getESGLevel(allPortfolioScore.Env)}
            </p>
          </Row>
          <Row className="bg-white text-darkTeal px-8 py-5 -ml-8 border-darkTeal border-4 flex items-center justify-between mt-2">
            <p className="text-xl w-1/3">Social</p>
            <p className="text-2xl font-bold w-1/4 text-right">
              {allPortfolioScore.Soc + "%"}
            </p>
            <p className="text-2xl font-bold w-1/4 mr-4">
              {getESGLevel(allPortfolioScore.Soc)}
            </p>
          </Row>
          <Row className="bg-white text-darkTeal px-8 py-5 -ml-8 border-darkTeal border-4 flex items-center justify-between mt-2">
            <p className="text-xl w-1/3">Governance</p>
            <p className="text-2xl font-bold w-1/4 text-right">
              {allPortfolioScore.Gov + "%"}
            </p>
            <p className="text-2xl font-bold w-1/4 mr-4">
              {getESGLevel(allPortfolioScore.Gov)}
            </p>
          </Row>
          <Row className="bg-white text-darkTeal px-8 py-2 -ml-8 border-darkTeal border-4 flex items-center justify-between mt-2">
            <p className="text-xl w-1/3">
              Sustainable
              <br />
              Procurement
            </p>
            <p className="text-2xl font-bold w-1/4 text-right">
              {allPortfolioScore.Sus + "%"}
            </p>
            <p className="text-2xl font-bold w-1/4 mr-4">
              {getESGLevel(allPortfolioScore.Sus)}
            </p>
          </Row>
        </Col>
      </Row>
      <Row className="w-full flex justify-center text-xl text-darkGreen font-semibold text-center mt-8">
        <p>Portfolio Breakdown by Dimension</p>
      </Row>
      <Row className="w-full flex justify-center text-lg text-white font-semibold text-center mt-2 gap-x-1">
        <p className="w-[20%] mr-2"></p>
        <p className="w-[10%] bg-[#004B53]">Exceptional</p>
        <p className="w-[10%] bg-[#00717D]">Progressive</p>
        <p className="w-[10%] bg-[#1B786E]">Good</p>
        <p className="w-[10%] bg-[#3D8F8F]">Fair</p>
        <p className="w-[10%] bg-[#4CB4B2]">Beginner</p>
      </Row>
      <Row className="w-full flex justify-center text-lg text-white mt-2 gap-x-1">
        <p className="w-[20%] text-darkGreen font-semibold text-right mr-2">
          Environmental
        </p>
        <p className="w-[10%] bg-[#004B53] justify-center flex items-center">
          {envRank[0]}%
        </p>
        <p className="w-[10%] bg-[#00717D] justify-center flex items-center">
          {envRank[1]}%
        </p>
        <p className="w-[10%] bg-[#1B786E] justify-center flex items-center">
          {envRank[2]}%
        </p>
        <p className="w-[10%] bg-[#3D8F8F] justify-center flex items-center">
          {envRank[3]}%
        </p>
        <p className="w-[10%] bg-[#4CB4B2] justify-center flex items-center">
          {envRank[4]}%
        </p>
      </Row>
      <Row className="w-full flex justify-center text-lg text-white mt-2 gap-x-1">
        <p className="w-[20%] text-darkGreen font-semibold text-right mr-2">
          Social
        </p>
        <p className="w-[10%] bg-[#004B53] justify-center flex items-center">
          {socRank[0]}%
        </p>
        <p className="w-[10%] bg-[#00717D] justify-center flex items-center">
          {socRank[1]}%
        </p>
        <p className="w-[10%] bg-[#1B786E] justify-center flex items-center">
          {socRank[2]}%
        </p>
        <p className="w-[10%] bg-[#3D8F8F] justify-center flex items-center">
          {socRank[3]}%
        </p>
        <p className="w-[10%] bg-[#4CB4B2] justify-center flex items-center">
          {socRank[4]}%
        </p>
      </Row>
      <Row className="w-full flex justify-center text-lg text-white mt-2 gap-x-1">
        <p className="w-[20%] text-darkGreen font-semibold text-right mr-2">
          Governance
        </p>
        <p className="w-[10%] bg-[#004B53] justify-center flex items-center">
          {govRank[0]}%
        </p>
        <p className="w-[10%] bg-[#00717D] justify-center flex items-center">
          {govRank[1]}%
        </p>
        <p className="w-[10%] bg-[#1B786E] justify-center flex items-center">
          {govRank[2]}%
        </p>
        <p className="w-[10%] bg-[#3D8F8F] justify-center flex items-center">
          {govRank[3]}%
        </p>
        <p className="w-[10%] bg-[#4CB4B2] justify-center flex items-center">
          {govRank[4]}%
        </p>
      </Row>
      <Row className="w-full flex justify-center text-lg text-white mt-2 gap-x-1">
        <p className="w-[20%] text-darkGreen font-semibold text-right mr-2">
          Sustainable Procurement
        </p>
        <p className="w-[10%] bg-[#004B53] justify-center flex items-center">
          {susRank[0]}%
        </p>
        <p className="w-[10%] bg-[#00717D] justify-center flex items-center">
          {susRank[1]}%
        </p>
        <p className="w-[10%] bg-[#1B786E] justify-center flex items-center">
          {susRank[2]}%
        </p>
        <p className="w-[10%] bg-[#3D8F8F] justify-center flex items-center">
          {susRank[3]}%
        </p>
        <p className="w-[10%] bg-[#4CB4B2] justify-center flex items-center">
          {susRank[4]}%
        </p>
      </Row>
      <Row className="w-full flex justify-center text-lg text-white mt-2 gap-x-1">
        <p className="w-[20%] text-darkGreen font-semibold text-right mr-2">
          Overall
        </p>
        <p className="w-[10%] bg-[#004B53] justify-center flex items-center">
          {overallRank[0]}%
        </p>
        <p className="w-[10%] bg-[#00717D] justify-center flex items-center">
          {overallRank[1]}%
        </p>
        <p className="w-[10%] bg-[#1B786E] justify-center flex items-center">
          {overallRank[2]}%
        </p>
        <p className="w-[10%] bg-[#3D8F8F] justify-center flex items-center">
          {overallRank[3]}%
        </p>
        <p className="w-[10%] bg-[#4CB4B2] justify-center flex items-center">
          {overallRank[4]}%
        </p>
      </Row>
      <Row className="w-full mt-8">
        <Col className="w-1/3 flex flex-col items-center">
          <p className="text-darkGreen text-lg font-semibold text-center">
            Portfolio Breakdown by
            <br />
            Number of Company Branches
          </p>
          {portfolioDonutChartTemp(portfolioBranches, 250, COLORS)}
          <div className="flex flex-col">
            {portfolioBranches.map((val, index) => (
              <Badge
                color={COLORS[index]}
                text={<span className="my-1">{val.name}</span>}
              ></Badge>
            ))}
          </div>
        </Col>
        <Col className="w-1/3 flex flex-col items-center">
          <p className="text-darkGreen text-lg font-semibold text-center">
            Portfolio Breakdown by
            <br />
            Company Annual Revenue
          </p>
          {portfolioDonutChartTemp(portfolioRevenue, 250, SIXCOLORS)}
          <div className="flex flex-col">
            {portfolioRevenue.map((val, index) => (
              <Badge
                color={SIXCOLORS[index]}
                text={<span className="my-1">{val.name}</span>}
              ></Badge>
            ))}
          </div>
        </Col>
        <Col className="w-1/3 flex flex-col items-center">
          <p className="text-darkGreen text-lg font-semibold text-center">
            Portfolio Breakdown by
            <br />
            Company Size
          </p>
          {portfolioDonutChartTemp(portfolioSize, 250, COLORS)}
          <div className="flex flex-col">
            {portfolioSize.map((val, index) => (
              <Badge
                color={COLORS[index]}
                text={<span className="my-1">{val.name}</span>}
              ></Badge>
            ))}
          </div>
        </Col>
      </Row>
      <Row className="mt-12 flex justify-between w-full h-[600px]">
        <Col className="w-[49%]">
          {/* <p className="text-darkGreen font-semibold text-lg">Top 5 Industries</p> */}
          <Table
            className="csiTable portfolioTable w-full"
            dataSource={[...industryRank]}
            pagination={false}
            rowClassName={(row, index) =>
              index % 2 === 0 ? "bg-white" : "bg-gray-100"
            }
          >
            <Column
              title="Top 5 Industries"
              dataIndex="industry"
              width={250}
              render={(row) => <p className="text-darkGreen">{row}</p>}
            />
            <Column
              title="ESG Maturity Level"
              render={(row) => {
                return (
                  <p className="text-darkGreen">
                    {row.score + "%"}&emsp;{getESGLevel(row.score)}
                  </p>
                );
              }}
            ></Column>
            <Column
              title="Company Percentage"
              render={(row) => {
                return <p className="text-darkGreen">{row.percentage + "%"}</p>;
              }}
            />
          </Table>
        </Col>
        <Col className="w-[49%]">
          {/* <p className="text-darkGreen font-semibold text-lg">Bottom 5 Industries</p> */}
          {industryBottomRank.length > 0 ? (
            <Table
              className="csiTable portfolioTable w-full"
              dataSource={[...industryBottomRank]}
              pagination={false}
              rowClassName={(row, index) =>
                index % 2 === 0 ? "bg-white" : "bg-gray-100"
              }
            >
              <Column
                title="Bottom 5 Industries"
                dataIndex="industry"
                width={250}
                render={(row) => <p className="text-darkGreen">{row}</p>}
              />
              <Column
                title="ESG Maturity Level"
                render={(row) => {
                  return (
                    <p className="text-darkGreen">
                      {row.score + "%"}&emsp;{getESGLevel(row.score)}
                    </p>
                  );
                }}
              ></Column>
              <Column
                title="Company Percentage"
                render={(row) => {
                  return (
                    <p className="text-darkGreen">{row.percentage + "%"}</p>
                  );
                }}
              />
            </Table>
          ) : null}
        </Col>
      </Row>
    </Row>
  );

  const page2 = () => (
    <Row className="mt-2 min-h-8/10 gap-x-8 w-full">
      <div className="w-full h-1500px">
        <Row className="w-full flex justify-between">
          <Col className="w-[49%]">
            <Table
              className="csiTable portfolioTable w-full"
              dataSource={[...smeRank]}
              pagination={false}
              rowClassName={(row, index) =>
                index % 2 === 0 ? "bg-white" : "bg-gray-100"
              }
            >
              <Column
                title="Top 10 Companies"
                dataIndex="companyName"
                width={350}
                render={(row) => <p className="text-darkGreen">{row}</p>}
              />
              <Column
                title="ESG Maturity Level"
                render={(row) => {
                  return (
                    <p className="text-darkGreen">
                      {row.score + "%"}&emsp;{getESGLevel(row.score)}
                    </p>
                  );
                }}
              ></Column>
            </Table>
          </Col>
          <Col className="w-[49%]">
            {smeBottomRank.length > 0 ? (
              <Table
                className="csiTable portfolioTable w-full"
                dataSource={[...smeBottomRank]}
                pagination={false}
                rowClassName={(row, index) =>
                  index % 2 === 0 ? "bg-white" : "bg-gray-100"
                }
              >
                <Column
                  title="Bottom 10 Companies"
                  dataIndex="companyName"
                  width={350}
                  render={(row) => <p className="text-darkGreen">{row}</p>}
                />
                <Column
                  title="ESG Maturity Level"
                  render={(row) => {
                    return (
                      <p className="text-darkGreen">
                        {row.score + "%"}&emsp;{getESGLevel(row.score)}
                      </p>
                    );
                  }}
                ></Column>
              </Table>
            ) : null}
          </Col>
        </Row>
        <Row className="mt-8">
          <p className="text-darkGreen text-lg font-semibold">Summary</p>
        </Row>
        <Row className="w-full flex justify-between mt-2">
          <Col className="w-[24.5%] bg-darkTeal rounded-tr-3xl rounded-bl-3xl px-4 py-8 text-white">
            <p className="mb-4 font-semibold">Environmental</p>
            <p>
              For the Environmental Dimension, {envRank[summary[0]]}% of your
              portfolio is in the {SCORELEVEL[summary[0]]} level which brings up
              the overall score to{" "}
              {allPortfolioScore.Env +
                "% (" +
                getESGLevel(allPortfolioScore.Env) +
                ")"}
              .
            </p>
          </Col>
          <Col className="w-[24.5%] bg-darkTeal rounded-tl-3xl rounded-br-3xl px-4 py-8 text-white">
            <p className="mb-4 font-semibold">Social</p>
            <p>
              For the Social Dimension, {socRank[summary[1]]}% of your portfolio
              is in the {SCORELEVEL[summary[1]]} level which brings down the
              overall score to{" "}
              {allPortfolioScore.Soc +
                "% (" +
                getESGLevel(allPortfolioScore.Soc) +
                ")"}
              .
            </p>
          </Col>
          <Col className="w-[24.5%] bg-darkTeal rounded-tr-3xl rounded-bl-3xl px-4 py-8 text-white">
            <p className="mb-4 font-semibold">Governance</p>
            <p>
              For the Governance Dimension, {govRank[summary[2]]}% of your
              portfolio is in the {SCORELEVEL[summary[2]]} level which brings
              down the overall score to{" "}
              {allPortfolioScore.Gov +
                "% (" +
                getESGLevel(allPortfolioScore.Gov) +
                ")"}
              .
            </p>
          </Col>
          <Col className="w-[24.5%] bg-darkTeal rounded-tl-3xl rounded-br-3xl px-4 py-8 text-white">
            <p className="mb-4 font-semibold">Sustainable Procurement</p>
            <p>
              For the Sustainable Procurement Dimension, {susRank[summary[3]]}%
              of your portfolio is in the {SCORELEVEL[summary[3]]} level which
              brings down the overall score to{" "}
              {allPortfolioScore.Sus +
                "% (" +
                getESGLevel(allPortfolioScore.Sus) +
                ")"}
              .
            </p>
          </Col>
        </Row>
        <Row className="mt-2 w-full">
          <Col className="w-full bg-darkTeal rounded-tl-3xl rounded-br-3xl px-4 py-8 text-white">
            <p>
              Overall, you have a Portfolio ESG Maturity Score of{" "}
              {allPortfolioScore.score +
                "% (" +
                getESGLevel(allPortfolioScore.score) +
                ")"}{" "}
              considering that majority of the connected companies in your
              portfolio are at the {SCORELEVEL[summary[4]]} level.
            </p>
          </Col>
        </Row>
        <Row className="my-8">
          <p className="text-darkGreen text-lg font-semibold">
            Company By States
          </p>
          {portfolioColumnChartTemp(stateRank, allAggScoreLength, 1000, false)}
        </Row>
      </div>
      <Row className="w-full justify-end text-darkGreen mt-8">
        <p>Report Generated on {date}</p>
      </Row>
      <Divider className="border-black my-0" />
      <Row>
        <p className="font-medium text-justify mt-2 text-darkGreen">
          © {footerYear} Centre For Sustainability Intelligence Sdn Bhd. CSI is
          not responsible for any errors of omissions, or for the results
          obtained from the use of this information. All information in this
          site is provided “as is ” with no guarantee of completeness, accuracy
          timeliness or of the results obtained from the use of this information
          and without warranty of any kind, express or implied, including, but
          not limited to warranties of performance, merchantability and fitness
          for a particular purpose. In no event will CSI, its related
          partnerships and corporations, or the directors, agents or employees
          thereof be liable to you or anyone else for any decision made or
          action taken in reliance on the information in this Report or any
          consequential, special or similar damages, even if advised or
          possibilities of such damages.
        </p>
      </Row>
    </Row>
  );

  return (
    <Layout className="min-h-full">
      <Content className="bg-white px-12 min-h-9/10 w-full">
        {page1()}
        {page2()}
      </Content>
    </Layout>
  );
}

export default HomePage;
