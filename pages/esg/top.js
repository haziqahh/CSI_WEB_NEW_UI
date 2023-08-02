import {
  Button,
  Layout,
  Row,
  Col,
  Badge,
  Progress,
  Tag,
  Table,
  Card,
  Modal,
  Input,
  Form,
  Tooltip,
  Checkbox,
  message,
  Upload,
  Select,
  Spin,
} from "antd";
import Header from "./header";
import UserImage from "../../assests/img/companyLogo.png";
import Footer from "../footer";
import APIHelpers from "../api/apiHelper";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  PlusOutlined,
  ShareAltOutlined,
  UploadOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import Search from "antd/lib/input/Search";
import { DIMENSION, STORAGE_URL } from "../../compenents/config";
import React, { useState, useEffect } from "react";
import { SearchFilter } from "../api/searchHelper";
import { useRouter } from "next/router";
import {
  ESGCalculation,
  IndexCalculation,
  getESGLevel,
} from "../api/calculationHelper";
import moment from "moment";
// import { LogoSignedUrl } from "../api/signedUrlHelper";
import {
  MSIC,
  POSTCODE,
  REPORTURL,
  STATE,
  WEBURL,
  DEPARTMENT,
  POSITIONLEVEL,
  TITLE,
  BUSINESSENTITY,
  PORTFOLIOREPORTURL,
  SUSBSCRIPTIONPLAN,
} from "../../compenents/config";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { multiRadarChart, radarChart } from "../../compenents/chart";

const { Content } = Layout;
const { Column } = Table;
const { Option } = Select;

const LearningList = [
  "ESG",
  "Environment",
  "Social",
  "Governance",
  "Sustainable Procurement",
];

function DashPage() {
  const router = useRouter();
  const [activeReportTable, setReportTable] = useState("assestment");
  const [activeLearningTable, setLearningTable] = useState("");
  const [addSmeUserModalVisible, setSmeUserModalVisible] = useState(false);
  const [editSmeUserModalVisible, setEditSmeUserModalVisible] = useState(false);
  const [company, setCompany] = useState({});
  const [profile, setProfile] = useState({});
  const [smeUsers, setSmeUsers] = useState([]);
  const [learningData, setLearningData] = useState({});
  const [learningTabList, setLearningTabList] = useState([]);
  const [assessment, setAssessment] = useState([]);
  const [completedAssessment, setCompletedAssessment] = useState([]);
  const [fullCompletedAssessment, setFullCompletedAssessment] = useState([]);
  const [continueAssessment, setContinueAssessment] = useState({});
  const [currentProgress, setCurrentProgress] = useState(0);
  const [lastAssessment, setLastAssessment] = useState("");
  const [accessLevel, setAccessLevel] = useState(-1);
  const [shareReportModalVisible, setShareReportModalVisible] = useState(false);
  const [reportID, setReportID] = useState("");
  const [reportSerialNo, setReportSerialNo] = useState("");
  const [sharedWith, setSharedWith] = useState([]);
  const [logo, setLogo] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [uploadLogoVisible, setUploadLogoVisible] = useState(false);
  const [editCompanyProfileVisible, setEditCompanyProfileVisible] =
    useState(false);
  const [edit] = Form.useForm();
  const [ssmFile, setSSMFile] = useState(null);
  const [selectState, setSelectState] = useState("");
  const [addUser] = Form.useForm();
  const [editUser] = Form.useForm();
  const [editUserData, setEditUserData] = useState({});
  const [selectEntity, setSelectEntity] = useState("");
  const [selectRegistered, setSelectRegistered] = useState(null);
  const [isSSM, setIsSSM] = useState(null);
  const [isDownload, setIsDownload] = useState(false);
  const [pendingShare, setPendingShare] = useState(false);
  const [pendingConnection, setPendingConnection] = useState(false);
  const [pendingVisible, setPendingVisible] = useState(false);
  const [selectEducation, setSelectEducation] = useState("");
  const [newConnectionVisible, setNewConnectionVisible] = useState(false);
  const [reqConnection, setReqConnection] = useState([]);
  const [recConnection, setRecConnection] = useState([]);
  const [linkedCompany, setLinkCompany] = useState([]);
  const [linkedCompanyId, setLinkCompanyId] = useState([]);
  const [fullLinkedCompany, setFullLinkedCompany] = useState([]);
  const [newCompany, setNewCompany] = useState([]);
  const [filteredCompany, setFilteredCompany] = useState([]);
  const [fullCompany, setFullCompany] = useState([]);
  const [allPortfolioScore, setAllPortfolioScore] = useState([]);
  const [fullPortfolioScore, setFullPortfolioScore] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);
  const [portfolioDataReady, setPortfolioDataReady] = useState(0);
  const [sharedAssessment, setSharedAssessment] = useState([]);
  const [fullSharedAssessment, setFullSharedAssessment] = useState([]);
  const [reportTabList, setReportTabList] = useState([]);
  const [subscriptionPlan, setSubscriptionPlan] = useState("");
  const [connectedCompany, setConnectedCompany] = useState([]);
  const [connectedCompanyDetails, setConnectedCompanyDetails] = useState([]);
  const [esgLevel, setEsgLevel] = useState("-");
  const [esgScoreLevels, setesgScoreLevels] = useState([]);
  const [page, setPage] = useState(1);
  const [score, setScore] = useState({});
  const [allScore, setAllScore] = useState({});
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    if (sessionStorage.getItem("role") === "VENDOR") {
      getVendorProfile();
    } else {
      getProfile();
    }
  }, []);

  useEffect(() => {
    if (Object.keys(profile).length > 0) {
      getSubscription();
      getCompany();
    }
  }, [profile]);

  useEffect(() => {
    setEsgLevel(getESGLevel(accessLevel));
  });

  useEffect(() => {
    if (Object.keys(company).length > 0) {
      getAssessment();
      // getSMEUsers();
      getSME();
      edit.setFieldsValue({
        name: company.companyName,
        businessEntity: company.businessEntity,
        educationType: company.educationType,
        ssmNum: company.ssmNumber,
        smeCorpRegistrationNumber: company.ssmCorpRegistrationNumber,
        postCode: company.postCode,
        msic: company.msic,
        state: company.state,
      });
    }
  }, [company]);

  useEffect(() => {
    if (Object.keys(continueAssessment).length > 0) {
      getContinueAssessment();
    }
  }, [continueAssessment]);

  useEffect(() => {
    if (completedAssessment.length > 0) {
      getAssessmentLevel();
    }
  }, [completedAssessment]);

  useEffect(() => {
    if (
      (pendingShare === true || pendingConnection === true) &&
      router.query.login
    ) {
      setPendingVisible(true);
    }
  }, [pendingShare, pendingConnection]);

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
      let connected = [];
      let connectedDetails = [];
      all.map((val, index) => {
        let com = [];
        let role = "";
        if (val.requestCompanyID !== company.id) {
          com = fullCompany.filter(
            (item) => item.id === val.requestCompanyID
          )[0];
          role = "receiver";
        } else {
          com = fullCompany.filter(
            (item) => item.id === val.receivedCompanyID
          )[0];
          role = "requestor";
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
          role: role,
          status:
            val.status === "INVITED"
              ? "Pending"
              : val.status === "ACTIVE"
              ? "Connected"
              : "Disconnected",
        });
        if (val.status !== "INACTIVE") {
          linked.push(com.id);
          if (val.status === "ACTIVE") {
            connected.push(com.id);
            connectedDetails.push({
              companyId: com.id,
              date: val.linkDate,
            });
          }
        }
        if (index === all.length - 1) {
          setLinkCompanyId(linked);
          setConnectedCompany(connected);
          setConnectedCompanyDetails(connectedDetails);
          setLinkCompany(
            connection.filter((item) => item.status !== "Disconnected")
          );
          setFullLinkedCompany(
            connection.filter((item) => item.status !== "Disconnected")
          );
          setFilteredCompany([]);
          setNewCompany(
            fullCompany.filter(
              (item) => item.id !== company.id && !linked.includes(item.id)
            )
          );
        }
      });
    } else {
      setFilteredCompany([]);
      setNewCompany(fullCompany.filter((item) => item.id !== company.id));
    }
  }, [reqConnection, recConnection]);

  useEffect(() => {
    if (Object.keys(company).length > 0 && fullCompany.length > 0) {
      getReqConnections();
      getRecConnections();
    }
  }, [company, fullCompany]);

  useEffect(() => {
    if (portfolioData.length > 0 && portfolioDataReady === 1) {
      let currentYear = new Date().getFullYear();
      let currentMonth = new Date().getMonth() + 1;
      let currentQuarter = Math.ceil(currentMonth / 3);
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
      linked = linked.sort(
        (a, b) => new Date(b.completionDate) - new Date(a.completionDate)
      );
      let year = new Object();
      let smeId = [];
      linked.map((val) => {
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
      });

      let portfolio = [];
      let totalEnv = 0;
      let totalSoc = 0;
      let totalGov = 0;
      let totalSus = 0;
      let totalScore = 0;
      Object.keys(year).map((val, index) => {
        let env = 0;
        let soc = 0;
        let gov = 0;
        let sus = 0;
        let score = 0;
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
              ESGCalculation(res.items)
                .then((res) => {
                  env += res["Environmental"];
                  soc += res["Social"];
                  gov += res["Governance"];
                  sus += res["Sustainable Procurement"];
                  // sus += 50;
                  score += res.overall;
                  totalEnv += res["Environmental"];
                  totalSoc += res["Social"];
                  totalGov += res["Governance"];
                  totalSus += res["Sustainable Procurement"];
                  // totalSus += 50;
                  totalScore += res.overall;
                  if (index1 === year[val].length - 1) {
                    setTimeout(() => {
                      if (
                        (currentYear === parseInt(yearValue) &&
                          currentQuarter > parseInt(quarter)) ||
                        currentYear > parseInt(yearValue)
                      ) {
                        portfolio.push({
                          name:
                            "Portfolio Report as of " +
                            quarter +
                            " " +
                            yearValue,
                          Env: Math.round(env / year[val].length),
                          Soc: Math.round(soc / year[val].length),
                          Gov: Math.round(gov / year[val].length),
                          Sus: Math.round(sus / year[val].length),
                          score: Math.round(score / year[val].length),
                          year: yearValue,
                          quarter: val.slice(-1),
                        });
                      }
                      if (index === Object.keys(year).length - 1) {
                        portfolio.unshift({
                          name: "Portfolio Report as of Today",
                          Env: Math.round(totalEnv / linked.length),
                          Soc: Math.round(totalSoc / linked.length),
                          Gov: Math.round(totalGov / linked.length),
                          Sus: Math.round(totalSus / linked.length),
                          score: Math.round(totalScore / linked.length),
                          year: yearValue,
                          quarter: val.slice(-1),
                        });
                        setEsgLevel(
                          getESGLevel(Math.round(totalScore / linked.length))
                        );
                        setAllPortfolioScore(portfolio);
                        setFullPortfolioScore(portfolio);
                      }
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

  useEffect(() => {
    getOwnAssesment();
    if (connectedCompany.length > 0 && Object.keys(company).length > 0) {
      // getAllAssessment();
      getAllCompletedAssesmentComparison();
    }
  }, [connectedCompany, company]);

  const getSubscription = () => {
    APIHelpers.GET("v1/subscriptions?corporateId=" + profile.companyID).then(
      (res) => {
        if (res.items) {
          setSubscriptionPlan(res.items.at(-1).subscriptionPlan);
        }
      }
    );
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
    APIHelpers.GET("v1/connections?requestCompanyID=" + company.id)
      .then((res) => {
        setReqConnection(res.items);
      })
      .catch(() => {});
  };

  const getRecConnections = () => {
    APIHelpers.GET("v1/connections?receivedCompanyID=" + company.id)
      .then((res) => {
        setRecConnection(res.items);
      })
      .catch(() => {});
  };

  const getCompany = () => {
    APIHelpers.GET("v1/smes?id=" + profile.companyID)
      .then((res) => {
        setSelectEntity(res.items[0].businessEntity);
        setSelectRegistered(res.items[0].registeredInEastMY);
        setSelectState(res.items[0].state.replace(/\s/g, ""));
        setSelectEntity(res.items[0].businessEntity);
        setSelectEducation(res.items[0].educationTypea);
        // if (res.items[0].profilePicture !== "") {
        //   LogoSignedUrl(res.items[0].profilePicture)
        //     .then((res) => {
        //       setCompanyLogo(res);
        //     })
        //     .catch(() => {});
        // }
        setCompanyLogo(STORAGE_URL + "/storage/" + res.items[0].profilePicture);
        setCompany(res.items[0]);
      })
      .catch(() => {});
  };

  const getAssessment = () => {
    APIHelpers.GET("v1/assessments?smeId=" + company.id)
      .then((res) => {
        if (res.items !== null) {
          if (
            res.items.filter(
              (item) => item.completionDate === "0001-01-01T00:00:00Z"
            ).length > 0
          ) {
            setContinueAssessment(
              res.items.filter(
                (item) => item.completionDate === "0001-01-01T00:00:00Z"
              )[0]
            );
          }
          res.items = res.items.filter(
            (item) => item.completionDate !== "0001-01-01T00:00:00Z"
          );
          res.items = res.items.sort(
            (a, b) => new Date(b.completionDate) - new Date(a.completionDate)
          );
          res.items.map((val) => {
            val.shared = [];
            if (val.sharedWiths !== null) {
              val.sharedWiths.map((val1) => {
                if (val1.status === "INVITED") {
                  setPendingShare(true);
                } else if (val1.status === "ACTIVE") {
                  val.shared.push(val1.corporateID);
                }
              });
            }
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
          });
          if (
            res.items.filter((item) => item.formatCompletionDate !== "01 Jan 1")
              .length > 0
          ) {
            let last = res.items.filter(
              (item) => item.formatCompletionDate !== "01 Jan 1"
            )[0];
            let lastDate = new Date(last.completionDate);
            let current = new Date();
            let months = Math.floor(
              (current - lastDate) / (1000 * 60 * 60 * 24 * 30)
            );
            if (months < 6) {
              lastDate = new Date(lastDate.setMonth(lastDate.getMonth() + 6));
              lastDate =
                ("0" + lastDate.getDate()).slice(-2) +
                "/" +
                ("0" + (lastDate.getMonth() + 1)).slice(-2) +
                "/" +
                lastDate.getFullYear();
              setCurrentProgress(100);
              setLastAssessment(lastDate);
            }
          }
          let completed = res.items.filter(
            (item) => item.formatCompletionDate !== "01 Jan 1"
          );
          completed.map((val, index) => {
            APIHelpers.GET("v1/assessmentEntries?assessmentId=" + val.id)
              .then((res) => {
                IndexCalculation(res.items)
                  .then((res) => {
                    val.score = res;
                    if (index === completed.length - 1) {
                      setTimeout(() => {
                        completed = completed.sort(
                          (a, b) =>
                            moment(a.oriDate).unix() - moment(b.oriDate).unix()
                        );
                        setCompletedAssessment(completed);
                        setFullCompletedAssessment(completed);
                      }, 1000);
                    }
                  })
                  .catch(() => {});
              })
              .catch(() => {});
          });
          setAssessment(res.items);
        }
      })
      .catch(() => {});
  };

  const getOwnAssesment = () => {
    APIHelpers.GET("v1/assessments?id=63b6be1385b6eb22fa470ec3").then((res) => {
      let assessment = res.items[0];
      let date = new Date(assessment.completionDate);
      assessment.formatCompletionDate =
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
      assessment.validityDate = validStart + " - " + validEnd;
      setCompletedAssessment(assessment);
      APIHelpers.GET("v1/assessmentEntries?assessmentId=" + assessment.id).then(
        (res) => {
          if (res.items !== null) {
            let structure = [];
            let index = 0;
            let doc = [];
            res.items.map((val, index1) => {
              if (
                val.questionType === "PSYCHOGRAPHIC" ||
                val.questionType === "UPLOAD"
              ) {
                val.questionNo = index + 1;
                index += 1;
                structure.push(
                  val.questionType === "PSYCHOGRAPHIC" ||
                    (val.questionType === "UPLOAD" &&
                      val.question.options.length < 3)
                    ? val.answer.scalar
                    : val.answer.text
                );
              }
              if (
                val.questionType === "UPLOAD" &&
                val.question.options.length > 2
              ) {
                doc = [...doc, ...val.answer.text];
              }
            });
            ESGCalculation(res.items)
              .then((score) => {
                setScore(score);
              })
              .catch(() => {});
          }
        }
      );
    });
  };

  // const getAllAssessment = () => {
  //   APIHelpers.GET("v1/assessments")
  //     .then((res) => {
  //       let complete = res.items.filter((item) => connectedCompany.includes(item.smeID) && item.completionDate !== "0001-01-01T00:00:00Z");
  //       if (complete.length > 0) {
  //         setPortfolioDataReady(portfolioDataReady + 1);
  //         setPortfolioData(complete);
  //       }
  //       complete = complete.sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate));
  //       complete.map((val, index) => {
  //         APIHelpers.GET("v1/assessmentEntries?assessmentId=" + val.id)
  //           .then((res) => {
  //             ESGCalculation(res.items)
  //               .then((res) => {
  //                 let date = new Date(val.completionDate);
  //                 val.oriDate = date;
  //                 val.formatCompletionDate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
  //                 let validStart = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
  //                 let validEnd = date;
  //                 validEnd.setDate(validEnd.getDate() - 1);
  //                 validEnd.setFullYear(validEnd.getFullYear() + 1);
  //                 validEnd = ("0" + validEnd.getDate()).slice(-2) + "/" + ("0" + (validEnd.getMonth() + 1)).slice(-2) + "/" + validEnd.getFullYear();
  //                 val.validityDate = validStart + " - " + validEnd;
  //                 let smeCompany = fullCompany.filter((item) => item.id === val.smeID)[0];
  //                 val.companyName = smeCompany.companyName;
  //                 val.industry = smeCompany.industry;
  //                 val.score = Math.round(res.overall);
  //                 let linkDate = new Date(connectedCompanyDetails.find((item) => item.companyId === val.smeID).date);
  //                 val.linkDate = ("0" + linkDate.getDate()).slice(-2) + "/" + ("0" + (linkDate.getMonth() + 1)).slice(-2) + "/" + linkDate.getFullYear();
  //                 if (val.sharedWiths !== null) {
  //                   if (val.sharedWiths.filter((item) => item.corporateID === company.id).length > 0) {
  //                     let status = val.sharedWiths.filter((item) => item.corporateID === company.id)[0].status;
  //                     // if (status === "ACTIVE") {
  //                     //   val.shared = true;
  //                     // }
  //                     val.shared = status;
  //                   }
  //                 }
  //                 if (index === complete.length - 1) {
  //                   setTimeout(() => {
  //                     setSharedAssessment(complete);
  //                     setFullSharedAssessment(complete);
  //                   }, 1000);
  //                 }
  //               })
  //               .catch(() => {});
  //           })
  //           .catch(() => {});

  //       });
  //     })
  //     .catch(() => {});

  // };

  const getAllCompletedAssesmentComparison = () => {
    APIHelpers.GET("v1/assessments")
      .then((res) => {
        if (res.items !== null) {
          // let all = res.items.filter((item) => item.completionDate !== "0001-01-01T00:00:00Z" && fullCompany.includes(item.smeID));
          let all = res.items;
          if (res.items.length > 1) {
            all = all.filter((item) => item.smeID !== company.id);
          }
          all = all.sort(
            (a, b) => new Date(b.completionDate) - new Date(a.completionDate)
          );
          let companyId = [];
          let allObj = new Object();
          let allAnswer = new Object();

          if (all.length > 0) {
            all.map((val, index) => {
              if (!companyId.includes(val.smeID)) {
                APIHelpers.GET("v1/assessmentEntries?assessmentId=" + val.id)
                  .then((res) => {
                    let scalarAnswer = res.items.filter(
                      (item) =>
                        item.questionType === "PSYCHOGRAPHIC" ||
                        (item.questionType === "UPLOAD" &&
                          item.question.options.length < 3)
                    );
                    scalarAnswer.map((val) => {
                      if (!(val.questionID in allAnswer)) {
                        allAnswer[val.questionID] = 0;
                      }
                      val.answer.scalar === true
                        ? (allAnswer[val.questionID] += 1)
                        : null;
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
                            allObj[score] = Math.round(
                              allObj[score] / all.length
                            );
                          });
                          companyId.push(val.smeID);
                          setSummary([
                            {
                              name: "Others",
                              data: [
                                allObj["Environmental"],
                                allObj["Governance"],
                                allObj["Sustainable Procurement"],
                                allObj["Social"],
                              ],
                            },
                            {
                              name: "Self",
                              data: [
                                score["Environmental"],
                                score["Governance"],
                                score["Sustainable Procurement"],
                                score["Social"],
                              ],
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

  // const getSMEUsers = () => {
  //   APIHelpers.GET("v1/smeUsers?companyId=" + company.id)
  //     .then((res) => {
  //       if (res.items) {
  //         let data = res.items.filter((item) => item.id !== profile.id && item.status === "ACTIVE");
  //         if (data.length > 0) {
  //           data.map((val) => {
  //             val.contact = "+" + val.contact;
  //             if (val.mobileContact !== "") {
  //               val.mobileContact = "+" + val.mobileContact;
  //             } else {
  //               val.mobileContact = "-";
  //             }
  //             let position = val.position.split("_");
  //             val.department = position[0];
  //             val.position = position[1];
  //           });
  //         }
  //         setSmeUsers(data);
  //       }
  //     })
  //     .catch(() => {});
  // };

  const getContinueAssessment = () => {
    APIHelpers.GET("v1/assessmentEntries?assessmentId=" + continueAssessment.id)
      .then((res) => {
        let fullLength = res.items.length;
        let inProgress = res.items.filter(
          (item) => item.respondStatus !== "TO_START"
        ).length;
        let progress = (inProgress / (fullLength - 1)) * 100;
        setCurrentProgress(Math.round(progress));
      })
      .catch(() => {});
  };

  const getAssessmentLevel = () => {
    APIHelpers.GET("v1/assessmentEntries?assessmentId=" + assessment[0].id)
      .then((res) => {
        IndexCalculation(res.items)
          .then((res) => {
            if (company.approvedBy !== null) {
              setAccessLevel(res);
            } else {
              setAccessLevel(-1);
            }
          })
          .catch(() => {});
      })
      .catch(() => {});
    console.log("test");
  };

  const getProfile = () => {
    APIHelpers.GET("v1/smeUser")
      .then((res) => {
        res.item.contact = "+" + res.item.contact;
        if (res.item.mobileContact !== "") {
          res.item.mobileContact = "+" + res.item.mobileContact;
        } else {
          res.item.mobileContact = "-";
        }
        let position = res.item.position.split("_");
        res.item.department = position[0];
        res.item.position = position[1];
        setProfile(res.item);
      })
      .catch(() => {});
  };

  const getVendorProfile = () => {
    APIHelpers.GET("v1/admin")
      .then((res) => {
        res.item.companyID = res.item.companyName;
        setProfile(res.item);
      })
      .catch(() => {});
  };

  const docProps = {
    name: "file",
    multiple: true,
    maxCount: 1,
    beforeUpload: (file) => {
      if (
        file.type !== "application/pdf" &&
        file.type !== "image/png" &&
        file.type !== "image/jpg" &&
        file.type !== "image/jpeg"
      ) {
        message.error({
          content: `${file.name} is an invalid file format. Please change the file extension to either .pdf, .png, .jpg, .jpeg.`,
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
        return Upload.LIST_IGNORE;
      } else if (file.size > 5242880) {
        message.error({
          content: `${file.name} is too large. Please upload another document that is smaller than 5MB.`,
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
        return Upload.LIST_IGNORE;
      } else {
        return true;
      }
    },
    onChange(info) {
      if (info.fileList.length > 0) {
        info.fileList[0].status = "done";
        setSSMFile(info.fileList[0].originFileObj);
      }
    },
  };

  const imgProps = {
    name: "file",
    multiple: true,
    maxCount: 1,
    beforeUpload: (file) => {
      if (
        file.type !== "image/png" &&
        file.type !== "image/jpg" &&
        file.type !== "image/jpeg"
      ) {
        message.error({
          content: `${file.name} is an invalid file format. Please change the file extension to either .png, .jpg, .jpeg.`,
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
        return Upload.LIST_IGNORE;
      } else if (file.size > 5242880) {
        message.error({
          content: `${file.name} is too large. Please upload another document that is smaller than 5MB.`,
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
        return Upload.LIST_IGNORE;
      } else {
        return true;
      }
    },
    onChange(info) {
      if (info.fileList.length > 0) {
        info.fileList[0].status = "done";
        setLogo(info.fileList[0].originFileObj);
      }
    },
  };

  const updateLogo = () => {
    let form = new FormData();
    form.append("profilePicture", logo);
    APIHelpers.PUT("v1/sme?id=" + company.id, form, {
      "Content-Type": "multipart/form-data",
    })
      .then(() => {
        let data = {
          linkedWiths: company.linkedWiths,
          participatedLearning: company.participatedLearning,
        };
        APIHelpers.PUT("v1/sme?id=" + company.id, data)
          .then(() => {
            message.success({
              content: "Your Company Logo was successfully uploaded.",
              style: {
                fontSize: "20px",
                marginTop: "100px",
              },
              duration: 5,
            });
            setUploadLogoVisible(false);
            setLogo(null);
            getCompany();
          })
          .catch(() => {
            message.error({
              content: "Your Company Logo was not uploaded.",
              style: {
                fontSize: "20px",
                marginTop: "100px",
              },
              duration: 8,
            });
          });
      })
      .catch(() => {
        message.error({
          content: "Your Company Logo was not uploaded.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
      });
  };

  const showUploadModal = () => {
    return (
      <Modal
        visible={uploadLogoVisible}
        className="Modal-rounded-login"
        footer={null}
        onCancel={() => setUploadLogoVisible(false)}
        width={700}
      >
        <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
          <p className="font-bold text-2xl">Upload Company Logo</p>
        </div>
        <div className="px-8 pt-8 pb-4 flex justify-center">
          <Upload {...imgProps}>
            <Button className="text-#21324E flex justify-center items-center bg-white border-#21324E w-full py-4 px-8 whitespace-pre-wrap	text-sm 1000:text-base font-semibold hover:bg-white focus:bg-white hover:text-#21324E focus:text-#21324E gap-x-2 hover:border-#21324E focus:border-#21324E border-4">
              <UploadOutlined />
              <p>Upload</p>
            </Button>
          </Upload>
        </div>
        <div className="px-8 pt-4 pb-8 flex justify-center">
          <Button
            className="bg-#21324E text-white hover:bg-#21324E focus:bg-#21324E hover:text-white focus:text-white"
            onClick={() => updateLogo()}
            disabled={logo === null ? true : false}
          >
            Submit
          </Button>
        </div>
      </Modal>
    );
  };

  const shopMSIC = MSIC.map((row) => {
    return (
      <Option value={row.code}>
        {row.code} - {row.industry}
      </Option>
    );
  });
  const showPending = () => {
    let text = "";
    let width = 600;
    if (pendingShare === true && pendingConnection === false) {
      text = "You have report share request pending.";
    } else if (pendingShare === false && pendingConnection === true) {
      text = "You have company connection request pending.";
    } else if (pendingShare === true && pendingConnection === true) {
      text =
        "You have company connection request and report share request pending.";
      width = 800;
    }
    return (
      <Modal
        visible={pendingVisible}
        className="mt-48"
        closable={false}
        footer={null}
        width={width}
        onCancel={() => setPendingVisible(false)}
      >
        <div className="flex justify-center items-center gap-x-2">
          <InfoCircleOutlined className="text-base 1000:text-lg text-orange-500" />
          <p className="font-semibold text-base 1000:text-lg">{text}</p>
        </div>
      </Modal>
    );
  };

  const showESGScoreLevels = (score) => {
    const scoreObj = Object.keys(score).map((key) => {
      return {
        key: key,
        score: score[key],
        level: getESGLevel(score[key]),
      };
    });

    return (
      <Row className="mt-8 justify-center">
        {scoreObj.map((scoreCategories) => (
          <Col className="margin: 0 auto;">
            <div
              className="rounded-2xl bg-smeProfile p-10 shadow-md ml-2"
              style={{ width: "280px", height: "180px" }}
              key={scoreCategories.key}
            >
              <p className="text-xl 1400:text-lg 820:text-md font-semibold text-sm w-1/3">
                {scoreCategories.key}
              </p>
              <p className="text-xl 1400:text-lg 820:text-md font-semibold text-sm w-1/3">
                {scoreCategories.score + "%"}
              </p>
              <p className="text-xl 1400:text-lg 820:text-md font-semibold text-sm w-1/3">
                {scoreCategories.level}
              </p>
            </div>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <Layout className="min-h-full">
      <Content className="bg-white 1150:px-12 px-8 min-h-3/10 w-full">
        <Row className="flex mt-8  gap-x-8 justify-between">
          <Col className="w-full 1150:w-12/12">
            <div className="rounded-2xl p-6 min-h-55vh 1150:h-30vh shadow-md">
              <div className="flex flex-col items-left justify-left h-full ">
                <div className="flex flex-col justify-left items-left text-left">
                  <Row className="mt-8 1000:mt-4">
                    <Col
                      xs={8}
                      className="d-flex gap-4 justify-center item-center"
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                        }}
                      >
                        {company.profilePicture === "" ? (
                          <Tooltip
                            title="Upload Company Logo"
                            className="cursor-pointer"
                            onClick={() => setUploadLogoVisible(true)}
                          >
                            <img
                              src={UserImage.src}
                              alt="Profile"
                              width={250}
                              height={250}
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip
                            title="Re-upload Company Logo"
                            className="cursor-pointer"
                            onClick={() => setUploadLogoVisible(true)}
                          >
                            <img
                              src={
                                companyLogo !== null
                                  ? companyLogo
                                  : UserImage.src
                              }
                              alt="Profile"
                              width={250}
                              height={250}
                            />
                          </Tooltip>
                        )}
                      </div>
                    </Col>

                    <Col xs={16} className="d-flex gap-4">
                      <Row>
                        <p className="1150:text-xl mb-4 1000:mb-4 font-semibold">
                          {company.companyName} ({company.ssmNumber})
                        </p>
                      </Row>
                      <Row>
                        <Col xs={8} className="d-flex gap-4">
                          <p className="text-sm 1000:text-base font-semibold mt-2 1000:mt-4">
                            Business Registration Certificate:
                          </p>
                          <p className="font-semibold text-sm 1000:text-base">
                            {company.ssmDoc !== ""
                              ? "Uploaded"
                              : "Not Uploaded"}
                          </p>
                          {company.approvedBy !== null ? (
                            <div>
                              <p className="text-sm 1000:text-base font-semibold mt-2 1000:mt-4">
                                Status:
                              </p>
                              <p className="font-semibold text-sm 1000:text-base">
                                Verified
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm 1000:text-base font-semibold mt-2 1000:mt-4">
                                Status:
                              </p>
                              <p className="font-semibold text-sm 1000:text-base">
                                Unverified
                              </p>
                            </div>
                          )}
                          <div className="text-sm 1000:text-base font-semibold mt-2 1000:mt-4">
                            Note:
                          </div>{" "}
                          {company.ssmDoc !== "" ? (
                            company.approvedBy !== null ? (
                              <div className="font-semibold text-sm 1000:text-base">
                                Your company has been verified
                              </div>
                            ) : (
                              <span className="font-semibold text-sm 1000:text-base">
                                We will verify your account shortly
                              </span>
                            )
                          ) : (
                            <span className="font-semibold text-sm 1000:text-base">
                              Please upload your business registration
                              certificate
                            </span>
                          )}
                        </Col>
                        <Col xs={8} className="d-flex gap-4">
                          {/* <p className="text-sm 1000:text-base font-semibold mt-2 1000:mt-4">My ESG Level:</p>
                      <p className="font-semibold text-sm 1000:text-base">{esgLevel}</p>  */}

                          {/* {subscriptionPlan !== "Single Business Plan" ? (
                        <div>
                          <p className="text-sm 1000:text-base font-semibold mt-2 1000:mt-4">My Portfolio ESG Score:</p>
                          {esgLevel >= 0 && esgLevel < 25 ? (
                            <p className="font-semibold text-sm 1000:text-base">Beginner</p>
                          ) : esgLevel >= 25 && esgLevel < 45 ? (
                            <p className="font-semibold text-sm 1000:text-base">Fair</p>
                          ) : esgLevel >= 45 && esgLevel < 65 ? (
                            <p className="font-semibold text-sm 1000:text-base">Good</p>
                          ) : esgLevel >= 65 && esgLevel < 85 ? (
                            <p className="font-semibold text-sm 1000:text-base">Progressive</p>
                          ) : esgLevel >= 85 && esgLevel <= 100 ? (
                            <p className="font-semibold text-sm 1000:text-base">Exceptional</p>
                          ) : (
                            <p className="font-semibold text-sm 1000:text-base">-</p>
                          )}
                        </div>
                        
                      ) : null}    */}
                          <p className="text-sm 1000:text-base font-semibold mt-2 1000:mt-4">
                            Connections:
                          </p>
                          <p className="font-semibold text-sm 1000:text-base">
                            {connectedCompany.length}
                          </p>
                          {/* {subscriptionPlan !== "Single Business Plan" ? <p className="text-sm 1000:text-base font-semibold mt-2 1000:mt-4">Reports Shared:</p> : null} */}
                          {/* {subscriptionPlan !== "Single Business Plan" ? <p className="font-semibold text-sm 1000:text-base">{fullSharedAssessment.filter((item) => item.shared === "ACTIVE").length}</p> : null} */}
                        </Col>
                        {/* <Col className="w-40%">
                      <p className="text-sm 1000:text-base font-semibold mt-2 1000:mt-4">Where you are now</p>
                        {summary.length > 0 ? (
                        <div className={window.screen.width > 1800 ? "flex justify-around" : ""}>
                          <div className="flex justify-center -mx-8 -mb-8 mt-2">{multiRadarChart(summary, window.screen.width * 0.2)}</div>
                          <div className={window.screen.width > 1800 ? "flex flex-col gap-y-4 justify-center" : "flex flex-col gap-y-4 justify-center mt-6"}>
                            <p><Badge color="#008080" text={company.companyName}></Badge></p>
                           <Badge color="#008080" text="Central for Sustainability Intelligence Sdn. Bhd."></Badge> 
                            <Badge color="#22c55e" text="Other Companies"></Badge> 
                          </div> 
                        </div> 
                    ) : null} 
                    </Col> */}
                      </Row>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        {/* {showESGScoreLevels(score)} */}
        <Row className="mt-8 rounded-lg">
          {reportID !== "" ? shareReport() : null}
          {showUploadModal()}
        </Row>
        {/* </Col> */}
      </Content>
    </Layout>
  );
}

export default DashPage;
