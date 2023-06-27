import { Button, Layout, Row, Col, Progress, Tag, Table, Card, Modal, Input, Form, Tooltip, Checkbox, message, Upload, Select, Spin } from "antd";
import Header from "./header";
import UserImage from "../../assests/img/companyLogo.png";
import DashPage from "./top";
import Footer from "../footer";
import APIHelpers from "../api/apiHelper";
import { CheckOutlined, CloseOutlined, DeleteOutlined, DownloadOutlined, EditOutlined, ExclamationCircleOutlined, EyeOutlined, InfoCircleOutlined, LoadingOutlined, PlusOutlined, ShareAltOutlined, UploadOutlined, UserAddOutlined, UserDeleteOutlined, UserOutlined, UserSwitchOutlined } from "@ant-design/icons";
import Search from "antd/lib/input/Search";
import React, { useState, useEffect } from "react";
import { SearchFilter } from "../api/searchHelper";
import { useRouter } from "next/router";
import { ESGCalculation, IndexCalculation } from "../api/calculationHelper";
import moment from "moment";
// import { LogoSignedUrl } from "../api/signedUrlHelper";
import { MSIC, POSTCODE, REPORTURL, STATE, WEBURL, DEPARTMENT, POSITIONLEVEL, TITLE, BUSINESSENTITY, PORTFOLIOREPORTURL, SUSBSCRIPTIONPLAN } from "../../compenents/config";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

const { Content } = Layout;
const { Column } = Table;
const { Option } = Select;

const LearningList = ["ESG", "Environment", "Social", "Governance", "Sustainable Procurement"];

function HomePage() {
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
  const [editCompanyProfileVisible, setEditCompanyProfileVisible] = useState(false);
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
  const [esgLevel, setEsgLevel] = useState(-1);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (sessionStorage.getItem("role") === "VENDOR") {
      getVendorProfile();
    } else {
      getProfile();
    }
  }, []);

  useEffect(() => {
    if (Object.keys(profile).length > 0) {
      // getSubscription();
      getCompany();
    }
  }, [profile]);

  useEffect(() => {
    if (Object.keys(company).length > 0) {
      // getAssessment();
      getSMEUsers();
      getSME();
      getLearningResource();
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
    if (selectEntity !== "") {
      if (selectEntity !== "EDUCATIONAL_INSTITUTION") {
        setSelectEducation("");
      }
      if (selectEntity === "GOVERNMENT") {
        edit.setFieldsValue({
          registered: null,
          educationType: null,
          ssmNum: "",
          msic: null,
        });
      }
    }
  }, [selectEntity]);

  useEffect(() => {
    if ((pendingShare === true || pendingConnection === true) && router.query.login) {
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
          com = fullCompany.filter((item) => item.id === val.requestCompanyID)[0];
          role = "receiver";
        } else {
          com = fullCompany.filter((item) => item.id === val.receivedCompanyID)[0];
          role = "requestor";
        }
        let date = new Date(val.linkDate);
        date = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
        connection.push({
          id: com.id,
          connectionId: val.id,
          companyName: com.companyName,
          ssmNumber: com.ssmNumber,
          industry: com.industry,
          linkDate: date,
          role: role,
          status: val.status === "INVITED" ? "Pending" : val.status === "ACTIVE" ? "Connected" : "Disconnected",
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
          setLinkCompany(connection.filter((item) => item.status !== "Disconnected"));
          setFullLinkedCompany(connection.filter((item) => item.status !== "Disconnected"));
          setFilteredCompany([]);
          setNewCompany(fullCompany.filter((item) => item.id !== company.id && !linked.includes(item.id)));
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
      linked = linked.sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate));
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
                      if ((currentYear === parseInt(yearValue) && currentQuarter > parseInt(quarter)) || currentYear > parseInt(yearValue)) {
                        portfolio.push({
                          name: "Portfolio Report as of " + quarter + " " + yearValue,
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
                        setEsgLevel(Math.round(totalScore / linked.length));
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
    if (connectedCompany.length > 0 && Object.keys(company).length > 0) {
      // getAllAssessment();
    }
  }, [connectedCompany, company]);

  // const getSubscription = () => {
  //   APIHelpers.GET("v1/subscriptions?corporateId=" + profile.companyID).then((res) => {
  //     if (res.items) {
  //       setSubscriptionPlan(res.items.at(-1).subscriptionPlan);
  //       if (res.items.at(-1).subscriptionPlan !== "Single Business Plan") {
  //         setReportTabList([
  //           {
  //             key: "assestment",
  //             tab: "My Assessment Report",
  //           },
  //           {
  //             key: "singleBusiness",
  //             tab: "Shared Assessment Report",
  //           },
  //           {
  //             key: "portfolio",
  //             tab: "Portfolio Report",
  //           },
  //           {
  //             key: "connection",
  //             tab: "My Connection",
  //           },
  //         ]);
  //       } else {
  //         setReportTabList([
  //           {
  //             key: "assestment",
  //             tab: "My Assessment Report",
  //           },
  //           {
  //             key: "connection",
  //             tab: "My Connection",
  //           },
  //         ]);
  //       }
  //     }
  //   });
  // };

  const getSME = () => {
    APIHelpers.GET("v1/smes")
      .then((res) => {
        if (res.items) {
          let filter = res.items.filter((item) => item.id !== company.id && !linkedCompany.includes(item.id));
          filter.map((val) => {
            val.industry = MSIC.filter((item) => item.code === val.msic)[0].industry;
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
        setCompanyLogo(WEBURL + "/storage/" + res.items[0].profilePicture);
        setCompany(res.items[0]);
      })
      .catch(() => {});
  };

  // const getAssessment = () => {
  //   APIHelpers.GET("v1/assessments?smeId=" + company.id)
  //     .then((res) => {
  //       if (res.items !== null) {
  //         if (res.items.filter((item) => item.completionDate === "0001-01-01T00:00:00Z").length > 0) {
  //           setContinueAssessment(res.items.filter((item) => item.completionDate === "0001-01-01T00:00:00Z")[0]);
  //         }
  //         res.items = res.items.filter((item) => item.completionDate !== "0001-01-01T00:00:00Z");
  //         res.items = res.items.sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate));
  //         res.items.map((val) => {
  //           val.shared = [];
  //           if (val.sharedWiths !== null) {
  //             val.sharedWiths.map((val1) => {
  //               if (val1.status === "INVITED") {
  //                 setPendingShare(true);
  //               } else if (val1.status === "ACTIVE") {
  //                 val.shared.push(val1.corporateID);
  //               }
  //             });
  //           }
  //           let date = new Date(val.completionDate);
  //           val.oriDate = date;
  //           val.formatCompletionDate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
  //           let validStart = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
  //           let validEnd = date;
  //           validEnd.setDate(validEnd.getDate() - 1);
  //           validEnd.setFullYear(validEnd.getFullYear() + 1);
  //           validEnd = ("0" + validEnd.getDate()).slice(-2) + "/" + ("0" + (validEnd.getMonth() + 1)).slice(-2) + "/" + validEnd.getFullYear();
  //           val.validityDate = validStart + " - " + validEnd;
  //         });
  //         if (res.items.filter((item) => item.formatCompletionDate !== "01 Jan 1").length > 0) {
  //           let last = res.items.filter((item) => item.formatCompletionDate !== "01 Jan 1")[0];
  //           let lastDate = new Date(last.completionDate);
  //           let current = new Date();
  //           let months = Math.floor((current - lastDate) / (1000 * 60 * 60 * 24 * 30));
  //           if (months < 6) {
  //             lastDate = new Date(lastDate.setMonth(lastDate.getMonth() + 6));
  //             lastDate = ("0" + lastDate.getDate()).slice(-2) + "/" + ("0" + (lastDate.getMonth() + 1)).slice(-2) + "/" + lastDate.getFullYear();
  //             setCurrentProgress(100);
  //             setLastAssessment(lastDate);
  //           }
  //         }
  //         let completed = res.items.filter((item) => item.formatCompletionDate !== "01 Jan 1");
  //         completed.map((val, index) => {
  //           APIHelpers.GET("v1/assessmentEntries?assessmentId=" + val.id)
  //             .then((res) => {
  //               IndexCalculation(res.items)
  //                 .then((res) => {
  //                   val.score = res;
  //                   if (index === completed.length - 1) {
  //                     setTimeout(() => {
  //                       completed = completed.sort((a, b) => moment(a.oriDate).unix() - moment(b.oriDate).unix());
  //                       setCompletedAssessment(completed);
  //                       setFullCompletedAssessment(completed);
  //                     }, 1000);
  //                   }
  //                 })
  //                 .catch(() => {});
  //             })
  //             .catch(() => {});
  //         });
  //         setAssessment(res.items);
  //       }
  //     })
  //     .catch(() => {});
  // };

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
  //                 // val.Env = Math.round(res.Environment.score);
  //                 // val.Soc = Math.round(res.Social.score);
  //                 // val.Gov = Math.round(res.Governance.score);
  //                 val.score = Math.round(res.overall);
  //                 // val.shared = false;
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

  const getSMEUsers = () => {
    APIHelpers.GET("v1/smeUsers?companyId=" + company.id)
      .then((res) => {
        if (res.items) {
          let data = res.items.filter((item) => item.id !== profile.id && item.status === "ACTIVE");
          if (data.length > 0) {
            data.map((val) => {
              val.contact = "+" + val.contact;
              if (val.mobileContact !== "") {
                val.mobileContact = "+" + val.mobileContact;
              } else {
                val.mobileContact = "-";
              }
              let position = val.position.split("_");
              val.department = position[0];
              val.position = position[1];
            });
          }
          setSmeUsers(data);
        }
      })
      .catch(() => {});
  };

  const getContinueAssessment = () => {
    APIHelpers.GET("v1/assessmentEntries?assessmentId=" + continueAssessment.id)
      .then((res) => {
        let fullLength = res.items.length;
        let inProgress = res.items.filter((item) => item.respondStatus !== "TO_START").length;
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

  const getLearningResource = () => {
    APIHelpers.GET("v1/learningResources")
      .then((res) => {
        let data = new Object();
        let tabList = [];
        res.items.map((val) => {
          if (company.participatedLearning !== null) {
            val.completed = company.participatedLearning.includes(val.id) ? true : false;
          } else {
            val.completed = false;
          }
        });
        LearningList.map((val) => {
          tabList.push({
            key: val,
            tab: val,
          });
          data[val] = res.items.filter((x) => x.indicator === val).sort((a, b) => a.title.localeCompare(b.title));
        });
        setLearningData(data);
        setLearningTabList(tabList);
        setLearningTable(LearningList[0]);
      })
      .catch(() => {});
  };

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

  //change tab
  const changeReportTab = (key) => {
    setReportTable(key);
  };

  const changeLearningTab = (key) => {
    setLearningTable(key);
  };

  //table
  const assestmentReportTable = () => {
    return (
      <div className="">
        <div className="flex justify-end">
          <Search
            className="self-end flex w-auto"
            maxLength={20}
            onSearch={(value) => {
              setCompletedAssessment([]);
              SearchFilter(fullCompletedAssessment, value)
                .then((res) => {
                  setCompletedAssessment(res);
                })
                .catch(() => {
                  setCompletedAssessment(fullCompletedAssessment);
                });
            }}
          />
        </div>
        <Table
          className="mt-4 titleRow"
          dataSource={[...completedAssessment]}
          scroll={{ x: 800 }}
          locale={{
            emptyText: <p className="text-black italic">There are no results that match your search.</p>,
          }}
          pagination={{
            position: ["bottomLeft"],
            defaultPageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50, 100],
          }}
        >
          <Column
            title={<p className="text-xs 1000:text-sm">Assessment ID</p>}
            sorter={(a, b) => a.serialNo.localeCompare(b.serialNo)}
            showSorterTooltip={false}
            render={(row) => {
              return <p className="text-xs 1000:text-sm">{company.approvedBy !== null ? row.serialNo : "Unknown"}</p>;
            }}
          />
          <Column
            title={<p className="text-xs 1000:text-sm">Completion Date</p>}
            sorter={(a, b) => moment(a.oriDate).unix() - moment(b.oriDate).unix()}
            showSorterTooltip={false}
            render={(row) => {
              return <p className="text-xs 1000:text-sm">{company.approvedBy !== null ? row.formatCompletionDate : "Unknown"}</p>;
            }}
          />
          <Column
            title={<p className="text-xs 1000:text-sm">Report Validity</p>}
            sorter={(a, b) => moment(a.oriDate).unix() - moment(b.oriDate).unix()}
            showSorterTooltip={false}
            render={(row) => {
              return <p className="text-xs 1000:text-sm">{company.approvedBy !== null ? row.validityDate : "Unknown"}</p>;
            }}
          />
          <Column
            title={<p className="text-xs 1000:text-sm">ESG Maturity Level</p>}
            render={(row) => {
              return (
                <div className="flex gap-x-2 items-center">
                  <span className={company.approvedBy !== null ? "w-10 text-xs 1000:text-sm" : "text-xs 1000:text-sm"}>{company.approvedBy !== null ? row.score + "%" : "Unknown"}</span>
                  {company.approvedBy !== null ? <p className="text-xs 1000:text-sm">{getESGLevel(row.score)}</p> : null}
                </div>
              );
            }}
            sorter={(a, b) => a.score - b.score}
            showSorterTooltip={false}
          ></Column>
          <Column title={<p className="text-xs 1000:text-sm">Shared</p>} render={(row) => <p className="text-xs 1000:text-sm">{row.sharedWiths !== null ? row.sharedWiths.filter((item) => item.status === "ACTIVE").length : 0}</p>}></Column>
          <Column
            title=""
            render={(row) => {
              return (
                <div className="flex gap-x-4 items-center text-xs 1000:text-sm">
                  {company.approvedBy !== null ? (
                    <Tooltip title="View">
                      <EyeOutlined
                        className="text-view cursor-pointer"
                        onClick={() => {
                          let link = document.createElement("a");
                          link.target = "_blank";
                          link.href = WEBURL + "/esg/indivReport?id=" + row.id + "&token=" + sessionStorage.getItem("accessToken");
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Pending verification">
                      <EyeOutlined className="text-gray-400 cursor-not-allowed" />
                    </Tooltip>
                  )}
                  {company.approvedBy !== null ? (
                    <Tooltip title="Download">
                      <DownloadOutlined
                        className="text-share cursor-pointer"
                        onClick={() => {
                          setIsDownload(true);
                          let data = REPORTURL + "/esg?target=" + WEBURL + "/esg/indivPdf?id=" + row.id + "&accessToken=" + sessionStorage.getItem("accessToken");
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
                              setIsDownload(false);
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
                              setIsDownload(false);
                            }
                          };
                          req.send();
                        }}
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Pending verification">
                      <DownloadOutlined className="text-gray-400 cursor-not-allowed" />
                    </Tooltip>
                  )}
                  {company.approvedBy !== null ? (
                    <Tooltip title="Share">
                      <ShareAltOutlined
                        className="text-orange-400 cursor-pointer"
                        onClick={() => {
                          setReportID(row.id);
                          setReportSerialNo(row.serialNo);
                          setShareReportModalVisible(true);
                        }}
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Pending verification">
                      <ShareAltOutlined className="text-gray-400 cursor-not-allowed" />
                    </Tooltip>
                  )}
                </div>
              );
            }}
          ></Column>
        </Table>
      </div>
    );
  };

  const corporateReportTable = () => {
    return (
      <div>
        <div className="flex justify-between">
          <p className="text-sm 1000:text-base">Connections: {fullLinkedCompany.filter((item) => item.status === "Connected").length}</p>
          <div className="flex gap-x-4">
            <Button className="bg-#21324E text-white text-xs 1000:text-sm flex items-center font-semibold hover:bg-#21324E focus:bg-#21324E hover:text-white focus:text-white" onClick={() => setNewConnectionVisible(true)}>
              <PlusOutlined />
              New Connection
            </Button>
            <Search
              className="self-end flex w-auto"
              maxLength={20}
              onSearch={(value) => {
                setLinkCompany([]);
                SearchFilter(fullLinkedCompany, value)
                  .then((res) => {
                    setLinkCompany(res);
                  })
                  .catch(() => {
                    setLinkCompany(fullLinkedCompany);
                  });
              }}
            />
          </div>
        </div>
        <Table
          className="mt-4 titleRow"
          dataSource={[...linkedCompany]}
          scroll={{ x: 800 }}
          locale={{
            emptyText: <p className="text-black italic">There are no results that match your search.</p>,
          }}
          pagination={{
            position: ["bottomLeft"],
            onChange: setPage,
            defaultPageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50, 100],
          }}
        >
          <Column title={<p className="text-xs 1000:text-sm">No</p>} width={50} render={(row, record, index) => <p className="text-xs 1000:text-sm">{(page - 1) * 5 + index + 1}</p>} />
          <Column title={<p className="text-xs 1000:text-sm">Company Name</p>} width={800} dataIndex="companyName" render={(row) => <p className="text-xs 1000:text-sm">{row}</p>} />
          <Column title={<p className="text-xs 1000:text-sm">Date Connected</p>} dataIndex="linkDate" render={(row) => <p className="text-xs 1000:text-sm">{row}</p>} />
          <Column title={<p className="text-xs 1000:text-sm">Status</p>} dataIndex="status" render={(row) => <p className="text-xs 1000:text-sm">{row}</p>} />
          <Column
            title={<p className="text-xs 1000:text-sm">Disconnect</p>}
            render={(row) => {
              return (
                <div className="flex gap-x-4 items-center text-xs 1000:text-sm">
                  {row.status === "Pending" && row.role === "receiver" ? (
                    <Tooltip title="Connect">
                      <UserAddOutlined className="text-share cursor-pointer text-xs 1000:text-sm" onClick={() => confirmConnect(row)} />
                    </Tooltip>
                  ) : row.status === "Pending" && row.role === "requestor" ? (
                    <Tooltip title="Pending">
                      <UserSwitchOutlined className="text-gray-400 text-xs 1000:text-sm" />
                    </Tooltip>
                  ) : null}
                  <Tooltip title="Disconnect">
                    <UserDeleteOutlined className="text-red-500 cursor-pointer text-xs 1000:text-sm" onClick={() => confirmDisconnect(row)} />
                  </Tooltip>
                </div>
              );
            }}
          ></Column>
        </Table>
      </div>
    );
  };

  const singleEntityReportTable = () => {
    return (
      <div>
        <div className="flex justify-between">
          <p className="text-xs 1000:text-sm">Report Shared: {sharedAssessment.filter((item) => item.shared === true).length}</p>
          <Search
            className="self-end flex w-auto"
            maxLength={20}
            onSearch={(value) => {
              setSharedAssessment([]);
              SearchFilter(fullSharedAssessment, value)
                .then((res) => {
                  setSharedAssessment(res);
                })
                .catch(() => {
                  setSharedAssessment(fullSharedAssessment);
                });
            }}
          />
        </div>
        <Table
          className="mt-4 titleRow"
          dataSource={[...sharedAssessment]}
          scroll={{ x: 800 }}
          locale={{
            emptyText: <p className="text-black italic">There are no results that match your search.</p>,
          }}
          pagination={{
            position: ["bottomLeft"],
            defaultPageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50, 100],
          }}
        >
          <Column title={<p className="text-xs 1000:text-sm">Connection Date</p>} dataIndex="linkDate" sorter={(a, b) => moment(a.linkDate).unix() - moment(b.linkDate).unix()} showSorterTooltip={false} render={(row) => <p className="text-xs 1000:text-sm">{row}</p>} />
          <Column title={<p className="text-xs 1000:text-sm">Company Name</p>} dataIndex="companyName" sorter={(a, b) => a.companyName.localeCompare(b.companyName)} showSorterTooltip={false} render={(row) => <p className="text-xs 1000:text-sm">{row}</p>} />
          <Column
            title={<p className="text-xs 1000:text-sm">Sector</p>}
            dataIndex="industry"
            ellipsis={{ showTitle: false }}
            width={200}
            sorter={(a, b) => a.industry.localeCompare(b.industry)}
            showSorterTooltip={false}
            render={(industry) => (
              <Tooltip placement="topLeft" title={industry}>
                {industry}
              </Tooltip>
            )}
          />
          <Column
            title={<p className="text-xs 1000:text-sm">Assessment ID</p>}
            dataIndex="serialNo"
            sorter={(a, b) => a.serialNo.localeCompare(b.serialNo)}
            showSorterTooltip={false}
            render={(_, record) => {
              return (
                <div className="flex gap-x-2 items-center text-xs 1000:text-sm">
                  <span>{record.shared === "ACTIVE" ? record.serialNo : "Unknown"}</span>
                </div>
              );
            }}
          />
          <Column
            title={<p className="text-xs 1000:text-sm">Completion Date</p>}
            dataIndex="formatCompletionDate"
            sorter={(a, b) => moment(a.oriDate).unix() - moment(b.oriDate).unix()}
            showSorterTooltip={false}
            render={(_, record) => {
              return (
                <div className="flex gap-x-2 items-center text-xs 1000:text-sm">
                  <span>{record.shared === "ACTIVE" ? record.formatCompletionDate : "Unknown"}</span>
                </div>
              );
            }}
          />
          <Column
            title={<p className="text-xs 1000:text-sm">Report Validity</p>}
            dataIndex="validityDate"
            sorter={(a, b) => moment(a.oriDate).unix() - moment(b.oriDate).unix()}
            showSorterTooltip={false}
            render={(_, record) => {
              return (
                <div className="flex gap-x-2 items-center text-xs 1000:text-sm">
                  <span>{record.shared === "ACTIVE" ? record.validityDate : "Unknown"}</span>
                </div>
              );
            }}
          />
          <Column
            title={<p className="text-xs 1000:text-sm">ESG Score</p>}
            render={(row) => {
              return (
                <div className="flex gap-x-2 items-center">
                  <span className={row.shared === "ACTIVE" ? "w-10 text-xs 1000:text-sm" : "text-xs 1000:text-sm"}>{row.shared === "ACTIVE" ? row.score + "%" : "Unknown"}</span>
                  {row.shared === "ACTIVE" ? <p className="text-xs 1000:text-sm">{getESGLevel(row.score)}</p> : null}
                </div>
              );
            }}
            sorter={(a, b) => a.score - b.score}
            showSorterTooltip={false}
          ></Column>
          <Column
            title={<p className="text-xs 1000:text-sm">Request to Share</p>}
            render={(row) => {
              return (
                <div className="flex gap-x-4 items-center text-xs 1000:text-sm">
                  {row.shared === "ACTIVE" ? (
                    <p className="text-xs 1000:text-sm">Shared</p>
                  ) : row.shared === "INVITED" ? (
                    <p className="text-xs 1000:text-sm">Requested</p>
                  ) : (
                    <Tooltip title="Request to share">
                      <ShareAltOutlined className="text-orange-400 cursor-pointer text-xs 1000:text-sm" onClick={() => confirmRequest(row)} />
                    </Tooltip>
                  )}
                </div>
              );
            }}
          ></Column>
          <Column
            title=""
            render={(row) => {
              return (
                <div className="flex gap-x-4 items-center text-xs 1000:text-sm">
                  {row.shared === "ACTIVE" ? (
                    <Tooltip title="View">
                      <EyeOutlined
                        className="text-view cursor-pointer"
                        onClick={() => {
                          let link = document.createElement("a");
                          link.target = "_blank";
                          link.href = WEBURL + "/esg/indivReport?id=" + row.id + "&token=" + sessionStorage.getItem("accessToken");
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      />
                    </Tooltip>
                  ) : null}
                  {row.shared === "ACTIVE" ? (
                    <Tooltip title="Download">
                      <DownloadOutlined
                        className="text-share cursor-pointer"
                        onClick={() => {
                          setIsDownload(true);
                          let data = REPORTURL + "/esg?target=" + WEBURL + "/esg/indivPdf?id=" + row.id + "&accessToken=" + sessionStorage.getItem("accessToken") + "&role=corporate";
                          let req = new XMLHttpRequest();
                          req.open("GET", data, true);
                          req.responseType = "blob";
                          req.onload = function () {
                            //Convert the Byte Data to BLOB object.
                            let blob = new Blob([req.response], { type: "application/octetstream" });
                            //Check the Browser type and download the File.
                            let isIE = false || !!document.documentMode;
                            if (isIE) {
                              window.navigator.msSaveBlob(blob, row.companyName + ".pdf");
                              setIsDownload(false);
                            } else {
                              let url = window.URL || window.webkitURL;
                              let link = url.createObjectURL(blob);
                              let a = document.createElement("a");
                              a.setAttribute("download", row.companyName + ".pdf");
                              a.target = "_blank";
                              a.setAttribute("href", link);
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              setIsDownload(false);
                            }
                          };
                          req.send();
                        }}
                      />
                    </Tooltip>
                  ) : null}
                </div>
              );
            }}
          ></Column>
        </Table>
      </div>
    );
  };

  const portfolioReportTable = () => {
    return (
      <div className="">
        <div className="flex justify-end ">
          {/* <p className="text-formTitleGreen font-bold text-lg">List of Portfolio reports</p> */}
          <Search
            className="self-end flex w-auto"
            maxLength={20}
            onSearch={(value) => {
              setAllPortfolioScore([]);
              SearchFilter(fullPortfolioScore, value)
                .then((res) => {
                  setAllPortfolioScore(res);
                })
                .catch(() => {
                  setAllPortfolioScore(fullPortfolioScore);
                });
            }}
          />
        </div>
        <Table
          className="titleRow mt-4"
          dataSource={[...allPortfolioScore]}
          // dataSource={[]}
          locale={{
            emptyText: <p className="text-black italic">There are no results that match your search.</p>,
          }}
          // dataSource={reportTemp}
          pagination={{ position: ["bottomLeft"], defaultPageSize: 5, showSizeChanger: true, pageSizeOptions: [5, 10, 20, 50, 100] }}
          scroll={{ x: 800 }}
        >
          <Column title={<p className="text-xs 1000:text-sm">Report Date</p>} dataIndex="name" sorter={(a, b) => a.name.localeCompare(b.name)} showSorterTooltip={false}></Column>
          <Column
            title={<p className="text-xs 1000:text-sm">Environmental</p>}
            sorter={(a, b) => a.Env - b.Env}
            showSorterTooltip={false}
            render={(row) => {
              return (
                <div className="flex items-center text-xs 1000:text-sm">
                  {row.Env + "%"}&emsp;{getESGLevel(row.Env)}
                </div>
              );
            }}
          ></Column>
          <Column
            title={<p className="text-xs 1000:text-sm">Social</p>}
            sorter={(a, b) => a.Soc - b.Soc}
            showSorterTooltip={false}
            render={(row) => {
              return (
                <div className="flex items-center text-xs 1000:text-sm">
                  {row.Soc + "%"}&emsp;{getESGLevel(row.Soc)}
                </div>
              );
            }}
          ></Column>
          <Column
            title={<p className="text-xs 1000:text-sm">Governance</p>}
            sorter={(a, b) => a.Gov - b.Gov}
            showSorterTooltip={false}
            render={(row) => {
              return (
                <div className="flex items-center text-xs 1000:text-sm">
                  {row.Gov + "%"}&emsp;{getESGLevel(row.Gov)}
                </div>
              );
            }}
          ></Column>
          <Column
            title={<p className="text-xs 1000:text-sm">Sustainable Procurement</p>}
            sorter={(a, b) => a.Sus - b.Sus}
            showSorterTooltip={false}
            render={(row) => {
              return (
                <div className="flex items-center text-xs 1000:text-sm">
                  {row.Sus + "%"}&emsp;{getESGLevel(row.Sus)}
                </div>
              );
            }}
          ></Column>
          <Column
            title={<p className="text-xs 1000:text-sm">ESG Portfolio Maturity Level</p>}
            sorter={(a, b) => a.score - b.score}
            showSorterTooltip={false}
            render={(row) => {
              return (
                <div className="flex items-center text-xs 1000:text-sm">
                  {row.score + "%"}&emsp;{getESGLevel(row.score)}
                </div>
              );
            }}
          ></Column>
          <Column
            title=""
            render={(row, record, index) => {
              return (
                <div className="flex gap-x-4 items-center text-xs 1000:text-sm">
                  {index === 0 ? (
                    <Tooltip title="View">
                      <EyeOutlined
                        className="text-view cursor-pointer"
                        onClick={() => {
                          let link = document.createElement("a");
                          link.target = "_blank";
                          link.href = WEBURL + "/esg/portfolioReport?id=" + company.id + "&token=" + sessionStorage.getItem("accessToken");
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      />
                    </Tooltip>
                  ) : null}
                  <Tooltip title="Download">
                    <DownloadOutlined
                      className="text-share cursor-pointer"
                      onClick={() => {
                        setIsDownload(true);
                        let data = "";
                        data = index !== 0 ? PORTFOLIOREPORTURL + "/esg?target=" + WEBURL + "/esg/portfolioPdf?id=" + company.id + "&year=" + row.year + "&quarter=" + row.quarter + "&accessToken=" + sessionStorage.getItem("accessToken") : PORTFOLIOREPORTURL + "/esg?target=" + WEBURL + "/esg/portfolioPdf?id=" + company.id + "&accessToken=" + sessionStorage.getItem("accessToken");
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
                            setIsDownload(false);
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
                            setIsDownload(false);
                          }
                        };
                        req.send();
                      }}
                    />
                  </Tooltip>
                </div>
              );
            }}
          ></Column>
        </Table>
      </div>
    );
  };

  const connectionModal = () => (
    <Modal visible={newConnectionVisible} footer={null} closable={false} onCancel={() => setNewConnectionVisible(false)} bodyStyle={{ overflowY: "scroll" }} width={1000}>
      <div className="flex justify-end items-center gap-x-2">
        <p className="font-semibold text-xs 1000:text-sm">Search company:</p>
        <Search
          className="self-end flex w-auto Connection-search"
          maxLength={20}
          onSearch={(value) => {
            setFilteredCompany([]);
            SearchFilter(newCompany, value)
              .then((res) => {
                setFilteredCompany(res);
              })
              .catch(() => {
                setFilteredCompany(newCompany);
              });
          }}
        />
      </div>
      <Table
        className="titleRow h-[600px] mt-4"
        dataSource={[...filteredCompany]}
        locale={{
          emptyText: <p className="text-black italic">There are no results that match your search.</p>,
        }}
        pagination={{ showSizeChanger: true, position: ["bottomLeft"], pageSize: 20 }}
        scroll={{ x: 800 }}
      >
        <Column title={<p className="text-xs 1000:text-sm">Company Name</p>} dataIndex="companyName" sorter={(a, b) => a.companyName.localeCompare(b.companyName)} showSorterTooltip={false} render={(row) => <p className="text-xs 1000:text-sm">{row}</p>} />
        <Column title={<p className="text-xs 1000:text-sm">Registration Number</p>} dataIndex="ssmNumber" sorter={(a, b) => a.ssmNumber.localeCompare(b.ssmNumber)} showSorterTooltip={false} render={(row) => <p className="text-xs 1000:text-sm">{row}</p>} />
        <Column title={<p className="text-xs 1000:text-sm">Industry</p>} dataIndex="industry" sorter={(a, b) => a.industry.localeCompare(b.industry)} showSorterTooltip={false} render={(row) => <p className="text-xs 1000:text-sm">{row}</p>} />
        <Column
          title={<p className="text-xs 1000:text-sm">Action</p>}
          render={(row) => (
            <div className="flex gap-x-4 items-center text-xs 1000:text-sm">
              <Tooltip title="Request to connect">
                <UserAddOutlined className="text-share cursor-pointer" onClick={() => requestConnection(row)} />
              </Tooltip>
            </div>
          )}
        />
      </Table>
    </Modal>
  );

  const requestConnection = (value) => {
    Modal.confirm({
      okText: "Confirm",
      cancelText: "Cancel",
      title: "Confirm to connect with " + value.companyName + "?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        createNewConnection(value);
      },
    });
  };

  const submitAddSmeUser = (values) => {
    let data = {
      companyID: company.id,
      title: values.title,
      firstName: values.firstName,
      lastName: values.lastName,
      position: values.department + "_" + values.position,
      contact: values.contact.slice(1).trim(),
      email: values.email,
      status: "ACTIVE",
      password: values.password,
      role: "USER",
    };

    values.mobile !== undefined ? (data.mobileContact = values.mobile.slice(1).trim()) : null;

    APIHelpers.POST("v1/smeUser", data)
      .then(() => {
        setSmeUserModalVisible(false);
        addUser.resetFields();
        message.success({
          content: "Authorised User added successfully.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 5,
        });
        getSMEUsers();
      })
      .catch(() => {
        message.error({
          content: "Fail to add authorised User.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
      });
  };

  const submitEditSmeUser = (values) => {
    let data = {
      companyID: company.id,
      title: values.title,
      firstName: values.firstName,
      lastName: values.lastName,
      position: values.department + "_" + values.position,
      contact: values.contact.slice(1).trim(),
      email: values.email,
    };

    values.mobile !== undefined ? (data.mobileContact = values.mobile.slice(1).trim()) : null;
    values.password !== undefined ? (data.password = values.password) : null;

    APIHelpers.PUT("v1/smeUser?id=" + editUserData.id, data)
      .then(() => {
        setEditSmeUserModalVisible(false);
        editUser.resetFields();
        message.success({
          content: "Edit Authorised User successfully.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 5,
        });
        if (sessionStorage.getItem("role") === "VENDOR") {
          getVendorProfile();
        } else {
          getProfile();
        }
        getSMEUsers();
      })
      .catch(() => {
        message.error({
          content: "Fail to edit Authorised User.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
      });
  };

  const addSmeUser = () => {
    return (
      <Modal visible={addSmeUserModalVisible} className="Modal-rounded" footer={null} onCancel={() => setSmeUserModalVisible(false)} width={700} bodyStyle={{ overflowY: "scroll" }}>
        <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
          <p className="font-bold text-base 1000:text-lg">Add Authorised User</p>
        </div>
        <p className="text-formTitleGreen font-semibold text-sm 1000:text-base px-8 mt-8">Personal Information</p>
        <div className="px-8 py-4">
          <Form layout="vertical" onFinish={submitAddSmeUser} form={addUser}>
            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Title</p>}
              name="title"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please select title!",
                },
              ]}
            >
              <Select>
                {TITLE.map((val) => (
                  <Option value={val}>{val}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">First Name</p>}
              name="firstName"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the first name!",
                },
              ]}
            >
              <Input maxLength={50} />
            </Form.Item>
            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Last Name</p>}
              name="lastName"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the last name!",
                },
              ]}
            >
              <Input maxLength={50} />
            </Form.Item>

            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Department</p>}
              name="department"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please select department",
                },
              ]}
            >
              <Select>
                {DEPARTMENT.map((val) => (
                  <Option value={val}>{val}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Designation Level</p>}
              name="position"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please select designation level",
                },
              ]}
            >
              <Select>
                {POSITIONLEVEL.map((val) => (
                  <Option value={val}>{val}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Contact No</p>}
              name="contact"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the Contact no",
                },
                {
                  validator(_, value) {
                    if (value && !isValidPhoneNumber(value)) {
                      return Promise.reject(new Error("Please input valid contact no!"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <PhoneInput defaultCountry="MY" international />
            </Form.Item>
            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Mobile No (Optional)</p>}
              name="mobile"
              hasFeedback
              rules={[
                {
                  validator(_, value) {
                    if (value && !isValidPhoneNumber(value)) {
                      return Promise.reject(new Error("Please input valid contact no!"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <PhoneInput defaultCountry="MY" international />
            </Form.Item>

            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Email</p>}
              name="email"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the Email!",
                },
                {
                  type: "email",
                  message: "Please input valid Email!",
                },
              ]}
            >
              <Input maxLength={100} />
            </Form.Item>
            <p className="text-formTitleGreen font-semibold text-sm 1000:text-base mt-2">Login Credentials</p>
            <div className="flex justify-between mt-4">
              <Form.Item
                label={<p className="font-semibold text-xs 1000:text-sm">Password</p>}
                name="password"
                className="w-49%"
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please input password!",
                  },
                  {
                    validator(_, value) {
                      if (value) {
                        if (value.length < 8 || value.length > 12 || !/[A-Z]/.test(value) || !/[0-9]/.test(value) || !/[a-z]/.test(value)) {
                          return Promise.reject(new Error("Password must contain 8 to 12 characters with at least 1 uppercase letter, lowercase letter and 1 number"));
                        }
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input.Password minLength={8} maxLength={12} />
              </Form.Item>
              <Form.Item
                label={<p className="font-semibold text-xs 1000:text-sm">Confirm Password</p>}
                name="confirmPassword"
                className="w-49%"
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please input password!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }

                      return Promise.reject(new Error("The two passwords that you entered do not match!"));
                    },
                  }),
                ]}
              >
                <Input.Password minLength={6} maxLength={20} />
              </Form.Item>
            </div>
            <Form.Item className="mb-2 text-right">
              <Button htmlType="submit" className="px-8 rounded-lg bg-gradient-to-t from-#DF3B57 to-#DF3B57CC text-white hover:bg-gradient-to-t focus:bg-gradient-to-t hover:text-white focus:text-white">
                SAVE
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    );
  };

  const editSmeUser = () => {
    return (
      <Modal visible={editSmeUserModalVisible} className="Modal-rounded" footer={null} onCancel={() => setEditSmeUserModalVisible(false)} width={700} bodyStyle={{ overflowY: "scroll" }}>
        <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
          <p className="font-bold text-base 1000:text-lg">Edit Authorised User</p>
        </div>
        <p className="text-formTitleGreen font-semibold text-sm 1000:text-base px-8 mt-8">Personal Information</p>
        <div className="px-8 py-4">
          <Form layout="vertical" onFinish={submitEditSmeUser} form={editUser}>
            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Title</p>}
              name="title"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please select title!",
                },
              ]}
            >
              <Select>
                {TITLE.map((val) => (
                  <Option value={val}>{val}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">First Name</p>}
              name="firstName"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the first name!",
                },
              ]}
            >
              <Input maxLength={50} />
            </Form.Item>
            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Last Name</p>}
              name="lastName"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the last name!",
                },
              ]}
            >
              <Input maxLength={50} />
            </Form.Item>

            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Department</p>}
              name="department"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please select department",
                },
              ]}
            >
              <Select>
                {DEPARTMENT.map((val) => (
                  <Option value={val}>{val}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Designation Level</p>}
              name="position"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please select designation level",
                },
              ]}
            >
              <Select>
                {POSITIONLEVEL.map((val) => (
                  <Option value={val}>{val}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Contact No</p>}
              name="contact"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the Contact no",
                },
                {
                  validator(_, value) {
                    if (value && !isValidPhoneNumber(value)) {
                      return Promise.reject(new Error("Please input valid contact no!"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <PhoneInput defaultCountry="MY" international />
            </Form.Item>
            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Mobile No (Optional)</p>}
              name="mobile"
              hasFeedback
              rules={[
                {
                  validator(_, value) {
                    if (value && !isValidPhoneNumber(value)) {
                      return Promise.reject(new Error("Please input valid contact no!"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <PhoneInput defaultCountry="MY" international />
            </Form.Item>

            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Email</p>}
              name="email"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the Email!",
                },
                {
                  type: "email",
                  message: "Please input valid Email!",
                },
              ]}
            >
              <Input maxLength={100} />
            </Form.Item>
            <p className={editUserData.id === profile.id || profile.role === "ADMIN" ? "text-formTitleGreen font-semibold text-sm 1000:text-base mt-2" : "hidden"}>Login Credentials</p>
            <div className={editUserData.id === profile.id || profile.role === "ADMIN" ? "flex justify-between mt-4" : "hidden"}>
              <Form.Item
                label={<p className="font-semibold text-xs 1000:text-sm">Password</p>}
                name="password"
                className="w-49%"
                hasFeedback
                rules={[
                  {
                    validator(_, value) {
                      if (value) {
                        if (value.length < 8 || value.length > 12 || !/[A-Z]/.test(value) || !/[0-9]/.test(value) || !/[a-z]/.test(value)) {
                          return Promise.reject(new Error("Password must contain 8 to 12 characters with at least 1 uppercase letter, lowercase letter and 1 number"));
                        }
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input.Password minLength={8} maxLength={12} />
              </Form.Item>
              <Form.Item
                label={<p className="font-semibold text-xs 1000:text-sm">Confirm Password</p>}
                name="confirmPassword"
                className="w-49%"
                hasFeedback
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }

                      return Promise.reject(new Error("The two passwords that you entered do not match!"));
                    },
                  }),
                ]}
              >
                <Input.Password minLength={6} maxLength={20} />
              </Form.Item>
            </div>
            <Form.Item className="mb-2 text-right ">
              <Button htmlType="submit" className="px-8 rounded-lg bg-gradient-to-t from-#DF3B57 to-#DF3B57CC text-white hover:bg-gradient-to-t focus:bg-gradient-to-t hover:text-white focus:text-white">
                SAVE
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    );
  };

  //choose table
  const showReportContentTab = {
    assestment: assestmentReportTable(),
    connection: corporateReportTable(),
    singleBusiness: singleEntityReportTable(),
    portfolio: portfolioReportTable(),
  };

  const updateConnection = (value, action) => {
    let id = [];
    let shared = [];
    fullCompletedAssessment.map((val) => {
      if (val.sharedWiths !== null) {
        val.sharedWiths = val.sharedWiths.filter((item) => item.corporateID !== value.id);
        id.push(val.id);
        shared.push(val.sharedWiths);
      }
    });

    fullSharedAssessment.map((val) => {
      if (val.smeID === value.id) {
        if (val.sharedWiths !== null) {
          val.sharedWiths = val.sharedWiths.filter((item) => item.corporateID !== company.id);
          id.push(val.id);
          shared.push(val.sharedWiths);
        }
      }
    });

    let data = {
      status: "",
    };
    if (action === "C") {
      data.status = "ACTIVE";
    } else {
      data.status = "INACTIVE";
    }
    APIHelpers.PUT("v1/connection?id=" + value.connectionId, data)
      .then(() => {
        if (action !== "C") {
          if (id.length > 0) {
            id.map((val, index) => {
              let data = {
                sharedWiths: shared[index],
              };
              APIHelpers.PUT("v1/assessment?id=" + val, data)
                .then(() => {
                  if (index === id.length - 1) {
                    getSME();
                    getAllAssessment();
                    message.success({
                      content: "You are no longer connected with " + value.companyName + ".",
                      style: {
                        fontSize: "20px",
                        marginTop: "100px",
                      },
                      duration: 5,
                    });
                  }
                })
                .catch(() => {
                  message.error({
                    content: "You cannot disconnect with " + value.companyName + ".",
                    style: {
                      fontSize: "20px",
                      marginTop: "100px",
                    },
                    duration: 8,
                  });
                });
            });
          } else {
            getSME();
            getAllAssessment();
            message.success({
              content: "You are no longer connected with " + value.companyName + ".",
              style: {
                fontSize: "20px",
                marginTop: "100px",
              },
              duration: 5,
            });
          }
        } else {
          getSME();
          getAllAssessment();
          message.success({
            content: "You are now connected with " + value.companyName + ".",
            style: {
              fontSize: "20px",
              marginTop: "100px",
            },
            duration: 5,
          });
        }
      })
      .catch(() => {});
  };

  const createNewConnection = (value) => {
    let data = {
      requestCompanyID: company.id,
      receivedCompanyID: value.id,
      linkDate: new Date(),
      status: "INVITED",
    };
    APIHelpers.POST("v1/connection", data)
      .then(() => {
        message.success({
          content: "Your request to connect with " + value.companyName + " was successful.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 5,
        });
        getSME();
      })
      .catch(() => {
        message.error({
          content: "Your request to connect with " + value.companyName + " was unsuccessful.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
      });
  };

  const confirmDisconnect = (value) => {
    Modal.confirm({
      okText: "Confirm",
      cancelText: "Cancel",
      title: "Confirm to disconnect with " + value.companyName + "?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        updateConnection(value, "D");
      },
    });
  };

  const confirmConnect = (value) => {
    Modal.confirm({
      okText: "Confirm",
      cancelText: "Cancel",
      title: "Confirm to connect with " + value.companyName + "?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        updateConnection(value, "C");
      },
    });
  };

  const confirmRequest = (value) => {
    Modal.confirm({
      okText: "Confirm",
      cancelText: "Cancel",
      title: "Confirm to request " + value.companyName + " to share report with assessment ID " + value.serialNo + "?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        requestShare(value);
      },
    });
  };

  const requestShare = (value) => {
    let share = value.sharedWiths;
    let request = [];
    if (share !== null) {
      if (share.filter((item) => item.corporateID === company.id).length === 0) {
        request.push({
          corporateID: company.id,
          linkDate: new Date(),
          status: "INVITED",
        });
      }
    } else {
      request = [
        {
          corporateID: company.id,
          linkDate: new Date(),
          status: "INVITED",
        },
      ];
    }
    let data = {
      sharedWiths: request,
    };
    APIHelpers.PUT("v1/assessment?id=" + value.id, data)
      .then(() => {
        message.success({
          content: "Your request to " + value.companyName + " for sharing their Assessment Report was successful.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 5,
        });
      })
      .catch(() => {
        message.error({
          content: "Your request to " + value.companyName + " for sharing their Assessment Report was unsuccessful.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
      });
  };

  const updateLearning = (row, value) => {
    let all = company.participatedLearning;
    if (value === true) {
      if (all === null) {
        all = [row.id];
      } else {
        all.push(row.id);
      }
    } else {
      let index = all.indexOf(row.id);
      all = all.splice(index, 1);
    }
    all = all.filter((v, i, a) => a.indexOf(v) === i);
    let data = {
      linkedWiths: company.linkedWiths,
      participatedLearning: all,
    };
    APIHelpers.PUT("v1/sme?id=" + company.id, data)
      .then(() => {
        getSME();
      })
      .catch(() => {});
  };

  const showLearningTable = (data, value) => (
    <Table
      className={activeLearningTable === value ? "visible mt-4 titleRow" : "hidden mt-4 titleRow"}
      dataSource={data}
      pagination={{
        showSizeChanger: true,
        position: ["bottomLeft"],
      }}
      scroll={{ x: 800 }}
      rowClassName="cursor-pointer"
      onRow={(record, rowIndex) => {
        return {
          onClick: (e, row, rowIndex) => {
            if (record.link !== "") {
              let getCurrentCellIndex = e.target.cellIndex;
              let getLastCellIndex = 3;
              if (getCurrentCellIndex !== getLastCellIndex && getCurrentCellIndex !== undefined) {
                let link = document.createElement("a");
                link.target = "_blank";
                link.href = record.link;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }
          },
        };
      }}
    >
      <Column title={<p className="text-xs 1000:text-sm">Title</p>} dataIndex="title" className="w-3/5 capitalize text-xs 1000:text-sm" />
      <Column title={<p className="text-xs 1000:text-sm">Source</p>} dataIndex="source" className="text-xs 1000:text-sm" />
      <Column title={<p className="text-xs 1000:text-sm">Type</p>} dataIndex="type" className="text-xs 1000:text-sm" />
      <Column title={<p className="text-xs 1000:text-sm">Completed</p>} render={(row) => <Checkbox defaultChecked={row.completed} onChange={(value) => updateLearning(row, value.target.checked)} />} />
    </Table>
  );

  const shareReport = () => {
    let report = assessment.filter((item) => item.id === reportID)[0];
    return (
      <Modal visible={shareReportModalVisible} className="Modal-rounded-login" closable={false} footer={null} onCancel={() => setShareReportModalVisible(false)} width={700}>
        <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
          <p className="font-bold text-2xl">Share Assessment Report</p>
        </div>
        <div className="px-8 py-8 flex flex-col Share-checkbox">
          {report.sharedWiths.length > 0 ? (
            report.sharedWiths.map((val) => (
              <Checkbox
                defaultChecked={val.status === "ACTIVE" ? true : false}
                onChange={(value) => {
                  if (value.target.checked === true) {
                    if (report.sharedWiths !== null) {
                      if (report.sharedWiths.filter((item) => item.corporateID === val.corporateID).length === 0) {
                        let data = report.sharedWiths;
                        data.push({
                          corporateID: val.corporateID,
                          linkDate: new Date(),
                          status: "ACTIVE",
                        });
                        setSharedWith(data);
                      } else {
                        let data = report.sharedWiths;
                        let index = report.sharedWiths.findIndex((item) => item.corporateID === val.corporateID);
                        data[index] = {
                          corporateID: val.corporateID,
                          linkDate: new Date(),
                          status: "ACTIVE",
                        };
                        setSharedWith(data);
                      }
                    } else {
                      let data = [
                        {
                          corporateID: val.corporateID,
                          linkDate: new Date(),
                          status: "ACTIVE",
                        },
                      ];
                      setSharedWith(data);
                    }
                  } else {
                    if (report.sharedWiths !== null) {
                      if (report.sharedWiths.filter((item) => item.corporateID === val.corporateID).length > 0) {
                        let data = report.sharedWiths;
                        let index = report.sharedWiths.findIndex((item) => item.corporateID === val.corporateID);
                        data[index] = {
                          corporateID: val.corporateID,
                          linkDate: new Date(),
                          status: "INVITED",
                        };
                        setSharedWith(data);
                      }
                    }
                  }
                }}
              >
                {fullCompany.filter((item) => item.id === val.corporateID)[0].companyName}
              </Checkbox>
            ))
          ) : (
            <p className="italic text-xl">No company request to share yet.</p>
          )}
          <div className="mt-4 text-right">
            {report.sharedWiths !== null ? (
              <Button onClick={() => updateShared(reportID)} className="px-8 rounded-lg bg-gradient-to-t from-#DF3B57 to-#DF3B57CC text-white hover:bg-gradient-to-t focus:bg-gradient-to-t hover:text-white focus:text-white">
                SHARE
              </Button>
            ) : null}
          </div>
        </div>
      </Modal>
    );
  };

  const updateShared = (id) => {
    if (sharedWith.length > 0) {
      let data = {
        sharedWiths: sharedWith,
      };
      APIHelpers.PUT("v1/assessment?id=" + id, data)
        .then(() => {
          getAssessment();
          message.success({
            content: "You have successfully updated your Assessment Report " + reportSerialNo + " sharing.",
            style: {
              fontSize: "20px",
              marginTop: "100px",
            },
            duration: 5,
          });
          setReportID("");
          setReportSerialNo("");
          setShareReportModalVisible(false);
        })
        .catch(() => {
          message.error({
            content: "Your Assessment Report " + reportSerialNo + " sharing was not updated.",
            style: {
              fontSize: "20px",
              marginTop: "100px",
            },
            duration: 8,
          });
        });
    } else {
      setReportID("");
      setReportSerialNo("");
      setShareReportModalVisible(false);
    }
  };

  const docProps = {
    name: "file",
    multiple: true,
    maxCount: 1,
    beforeUpload: (file) => {
      if (file.type !== "application/pdf" && file.type !== "image/png" && file.type !== "image/jpg" && file.type !== "image/jpeg") {
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
      if (file.type !== "image/png" && file.type !== "image/jpg" && file.type !== "image/jpeg") {
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
      <Modal visible={uploadLogoVisible} className="Modal-rounded-login" footer={null} onCancel={() => setUploadLogoVisible(false)} width={700}>
        <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
          <p className="font-bold text-base 1000:text-lg">Upload Company Logo</p>
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
          <Button className="bg-#21324E text-white hover:bg-#21324E focus:bg-#21324E hover:text-white focus:text-white" onClick={() => updateLogo()} disabled={logo === null ? true : false}>
            Submit
          </Button>
        </div>
      </Modal>
    );
  };

  const updateCompanyProfile = (values) => {
    let form = new FormData();
    if (company) {
      ssmFile !== null ? form.append("ssmDoc", ssmFile) : null;
      form.append("state", values.state);
      form.append("postCode", values.postCode);
      form.append("msic", values.msic);
      form.append("companyName", values.name);
      form.append("businessEntity", values.businessEntity);
      form.append("registeredInEastMy", selectRegistered);
      values.smeCorpRegistrationNumber !== undefined ? form.append("smeCorpRegistrationNumber", values.smeCorpRegistrationNumber) : null;
      company.ssmNumber !== values.ssmNum ? form.append("ssmNumber", values.ssmNum) : null;
      company.oldSSMNumber !== values.oldSsmNum ? form.append("oldSSMNumber", values.oldSsmNum) : null;
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
              setEditCompanyProfileVisible(false);
              message.success({
                content: "Your Company Profile has been updated.",
                style: {
                  fontSize: "20px",
                  marginTop: "100px",
                },
                duration: 5,
              });
              edit.resetFields();
              setCompany([]);
              getCompany();
            })
            .catch(() => {
              message.error({
                content: "Your Company Profile was not updated.",
                style: {
                  fontSize: "20px",
                  marginTop: "100px",
                },
                duration: 8,
              });
            });
        })
        .catch((err) => {
          if ("response" in err) {
            if ("data" in err.response) {
              if ("error" in err.response.data) {
                if ("code" in err.response.data.error) {
                  if (err.response.data.error.code.includes("ssm_number_found")) {
                    message.error({
                      content: "Your Company Profile was not updated. Business Registration Number has been used.",
                      style: {
                        fontSize: "20px",
                        marginTop: "100px",
                      },
                      duration: 8,
                    });
                  } else if (err.response.data.error.code.includes("company_name_found")) {
                    message.error({
                      content: "Your Company Profile was not updated. Company Name has been used.",
                      style: {
                        fontSize: "20px",
                        marginTop: "100px",
                      },
                      duration: 8,
                    });
                  } else {
                    message.error({
                      content: "Your Company Profile was not updated.",
                      style: {
                        fontSize: "20px",
                        marginTop: "100px",
                      },
                      duration: 8,
                    });
                  }
                }
              }
            }
          } else {
            message.error({
              content: "Your Company Profile was not updated.",
              style: {
                fontSize: "20px",
                marginTop: "100px",
              },
              duration: 8,
            });
          }
        });
    }
  };

  const showEditCompanyProfile = () => {
    return (
      <Modal visible={editCompanyProfileVisible} className="Modal-rounded" footer={null} onCancel={() => setEditCompanyProfileVisible(false)} width={700} bodyStyle={{ overflowY: "scroll" }}>
        <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
          <p className="font-bold text-base 1000:text-lg">Edit Company Profile</p>
        </div>
        <p className="text-formTitleGreen font-semibold text-sm 1000:text-base px-8 mt-8">Company Information</p>
        <div className="px-8 py-4">
          <Form layout="vertical" onFinish={updateCompanyProfile} form={edit}>
            <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Company Name</p>} name="name" hasFeedback>
              <Input maxLength={100} disabled={company.approvedBy !== null ? true : false} />
            </Form.Item>
            <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Business / Organisation Type</p>} name="businessEntity" hasFeedback>
              <Select onChange={(value) => setSelectEntity(value)} disabled={company.approvedBy !== null ? true : false}>
                {BUSINESSENTITY.map((val) => (
                  <Option value={val.key}>{val.data}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Business / Organisation registered in Sabah or Sarawak?</p>} name="registeredInEastMY" hasFeedback>
              <Select onChange={(value) => setSelectRegistered(value)} disabled={company.approvedBy !== null ? true : selectEntity === "GOVERNMENT" ? true : false}>
                <Option value={true}>Yes</Option>
                <Option value={false}>No</Option>
              </Select>
            </Form.Item>
            <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Education Institution Type</p>} name="educationType" hasFeedback>
              <Select onChange={(value) => setSelectEducation(value)} disabled={company.approvedBy !== null ? true : selectEntity === "EDUCATIONAL_INSTITUTION" ? false : true}>
                <Option value={"public"}>Public</Option>
                <Option value={"private"}>Private</Option>
              </Select>
            </Form.Item>
            <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Business / Organisation Registration Number (i.e. SSM / ROS number)</p>} name="ssmNum" hasFeedback>
              <Input
                type={isSSM === 1 ? "number" : ""}
                maxLength={24}
                disabled={company.approvedBy !== null ? true : selectEntity === "GOVERNMENT" || (selectEntity === "EDUCATIONAL_INSTITUTION" && selectEducation === "public") ? true : false}
                onChange={(value) => {
                  let val = value.target.value.replace(/[^0-9a-z]/gi, "");
                  edit.setFieldsValue({
                    ssmNum: val,
                  });
                }}
              />
            </Form.Item>
            <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Business / Organisation Registration File</p>} name="ssmFile" hasFeedback className={company.approvedBy !== null ? "hidden" : "visible"}>
              <Upload {...docProps}>
                <Button className="text-white flex items-center py-2 px-4 bg-gradient-to-t from-#DF3B57 to-#DF3B57CC hover:bg-gradient-to-t focus:bg-gradient-to-tC hover:text-white focus:text-white">
                  <UploadOutlined className="text-xl text-white" />
                  Upload File
                </Button>
              </Upload>
            </Form.Item>
            <div className="flex justify-between">
              <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">State</p>} name="state" hasFeedback className="w-49%">
                <Select
                  onChange={(value) => {
                    setSelectState(value.replace(/\s/g, ""));
                    edit.setFieldsValue({ postCode: "" });
                  }}
                  disabled={company.approvedBy !== null ? true : false}
                >
                  {STATE.map((val) => (
                    <Option value={val}>{val}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Postcode</p>} name="postCode" hasFeedback className="w-49%">
                <Select showSearch optionFilterProp="children" disabled={company.approvedBy !== null ? true : selectState === "" ? true : false}>
                  {selectState !== "" ? POSTCODE[selectState].map((val) => <Option value={val}>{val}</Option>) : null}
                </Select>
              </Form.Item>
            </div>
            <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">MSIC</p>} name="msic" hasFeedback>
              <Select style={{ width: "100%" }} disabled={company.approvedBy !== null ? true : selectEntity === "GOVERNMENT" || (selectEntity === "EDUCATIONAL_INSTITUTION" && selectEducation === "public") ? true : false}>
                {shopMSIC}
              </Select>
            </Form.Item>
            <Form.Item className="mb-2 text-right ">
              <Button htmlType="submit" disabled={company.approvedBy !== null ? true : false} className="px-8 rounded-lg bg-gradient-to-t from-#DF3B57 to-#DF3B57CC text-white hover:bg-gradient-to-t focus:bg-gradient-to-t hover:text-white focus:text-white">
                SAVE
              </Button>
            </Form.Item>
          </Form>
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

  const confirmToDelete = (values, name) => {
    Modal.confirm({
      okText: "Confirm",
      cancelText: "Cancel",
      title: "Confirm to delete " + name + " from authorised users?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        deactivateUser(values);
      },
    });
  };

  const deactivateUser = (values) => {
    let data = {
      status: "INACTIVE",
    };
    APIHelpers.PUT("v1/smeUser?id=" + values, data)
      .then(() => {
        message.success({
          content: "Authorised User has been deleted.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 5,
        });
        getSMEUsers();
      })
      .catch(() => {
        message.error({
          content: "Authorised User was not deleted.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
      });
  };

  const showDownload = () => {
    return (
      <Modal visible={isDownload} className="" footer={null} closable={false} width={600}>
        <div className="flex justify-center items-center gap-x-4">
          <Spin indicator={<LoadingOutlined spin />} />
          <p className="font-semibold text-base 1000:text-lg">Please wait for your report to be downloaded.</p>
        </div>
      </Modal>
    );
  };

  const showPending = () => {
    let text = "";
    let width = 600;
    if (pendingShare === true && pendingConnection === false) {
      text = "You have report share request pending.";
    } else if (pendingShare === false && pendingConnection === true) {
      text = "You have company connection request pending.";
    } else if (pendingShare === true && pendingConnection === true) {
      text = "You have company connection request and report share request pending.";
      width = 800;
    }
    return (
      <Modal visible={pendingVisible} className="mt-48" closable={false} footer={null} width={width} onCancel={() => setPendingVisible(false)}>
        <div className="flex justify-center items-center gap-x-2">
          <InfoCircleOutlined className="text-base 1000:text-lg text-orange-500" />
          <p className="font-semibold text-base 1000:text-lg">{text}</p>
        </div>
      </Modal>
    );
  };

  return (
    <Layout className="min-h-full">
      <Header></Header>
      <Content className="bg-white 1150:px-12 px-8 min-h-9/10 w-full pb-16">
      <DashPage></DashPage>
        {/* <Row className="flex mt-8 min-h-8/10 gap-x-8 justify-between "> */}
          {/* <Col className="w-full 1150:w-9/12 block 1150:hidden mb-4"> */}
            {/* <div
              className="flex justify-center 700:justify-end items-center gap-x-2 cursor-pointer font-semibold text-gray-400 text-lg underline underline-offset-2 decoration-dotted"
              onClick={() => {
                sessionStorage.clear();
                router.push("/ESG-sustainability-login");
              }}
            >
              <p>Logout</p>
            </div> */}
          {/* </Col> */}
          {/* <Col className="w-full 1150:w-5/5"> */}
            
              
               
                  {/* <p className="text-center 1150:text-xl mb-4 1000:mb-4 font-semibold">{company.companyName}</p> */}
                  {/* {company.profilePicture === "" ? (
                    <Tooltip title="Upload Company Logo" className="cursor-pointer" onClick={() => setUploadLogoVisible(true)}>
                      <img src={UserImage.src} alt="Profile" width={150} height={150} />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Re-upload Company Logo" className="cursor-pointer" onClick={() => setUploadLogoVisible(true)}>
                      <img src={companyLogo !== null ? companyLogo : UserImage.src} alt="Profile" width={150} height={150} />
                    </Tooltip>
                  )} */}
                  {/* <p className="text-sm 1000:text-base font-semibold mt-2 1000:mt-4">My ESG Score</p> */}
                  {/* {accessLevel >= 0 && accessLevel < 25 ? (
                    <p className="font-semibold text-sm 1000:text-base">Beginner</p>
                  ) : accessLevel >= 25 && accessLevel < 45 ? (
                    <p className="font-semibold text-sm 1000:text-base">Fair</p>
                  ) : accessLevel >= 45 && accessLevel < 65 ? (
                    <p className="font-semibold text-sm 1000:text-base">Good</p>
                  ) : accessLevel >= 65 && accessLevel < 85 ? (
                    <p className="font-semibold text-sm 1000:text-base">Progressive</p>
                  ) : accessLevel >= 85 && accessLevel <= 100 ? (
                    <p className="font-semibold text-sm 1000:text-base">Exceptional</p>
                  ) : (
                    <p className="font-semibold text-sm 1000:text-base">-</p>
                  )} */}
                  {/* {subscriptionPlan !== "Single Business Plan" ? (
                    <div>
                      <p className="text-sm 1000:text-base font-semibold mt-2 1000:mt-4">My Portfolio ESG Score</p>
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
                  ) : null} */}
                  {/* <p className="text-sm 1000:text-base font-semibold mt-2 1000:mt-4">Connections</p>
                  <p className="font-semibold text-sm 1000:text-base">{connectedCompany.length}</p>
                  {subscriptionPlan !== "Single Business Plan" ? <p className="text-sm 1000:text-base font-semibold mt-2 1000:mt-4">Reports Shared</p> : null}
                  {subscriptionPlan !== "Single Business Plan" ? <p className="font-semibold text-sm 1000:text-base">{fullSharedAssessment.filter((item) => item.shared === "ACTIVE").length}</p> : null} */}
                
              
            
            {/* <div className="bg-white p-4 shadow-md rounded-lg mt-4 border-2">
              <p className="font-semibold text-sm 1000:text-base text-#21324E">Authorised Users</p>
              <div className="flex gap-x-4 items-center py-4 border-b-4 ">
                <div className="flex flex-col grow">
                  <p className="text-#21324E font-semibold text-xs">{profile.firstName + " " + profile.lastName}</p>
                  <p className="text-#21324E font-semibold text-xs">{profile.department}</p>
                  <p className="text-#21324E font-semibold text-xs">{profile.position}</p>
                </div>
                <div className="grow-0 flex gap-x-4 ">
                  <EditOutlined
                    className="text-base cursor-pointer"
                    onClick={() => {
                      setEditUserData(profile);
                      editUser.setFieldsValue({
                        firstName: profile.firstName,
                        lastName: profile.lastName,
                        contact: profile.contact,
                        mobile: profile.mobileContact !== "-" ? profile.mobileContact : "",
                        email: profile.email,
                        title: profile.title,
                        department: profile.department,
                        position: profile.position,
                      });
                      setEditSmeUserModalVisible(true);
                    }}
                  />
                </div>
              </div>
              {smeUsers.map((val) => (
                <div className="flex gap-x-4 items-center py-4 border-b-4 ">
                  <div className="flex flex-col grow">
                    <p className="text-#21324E font-semibold text-xs">{val.firstName + " " + val.lastName}</p>
                    <p className="text-#21324E font-semibold text-xs">{val.department}</p>
                    <p className="text-#21324E font-semibold text-xs">{val.position}</p>
                  </div>
                  <div className="grow-0 flex gap-x-4 ">
                    {val.role !== "ADMIN" ? (
                      <EditOutlined
                        className="text-base cursor-pointer"
                        onClick={() => {
                          setEditUserData(val);
                          editUser.setFieldsValue({
                            firstName: val.firstName,
                            lastName: val.lastName,
                            contact: val.contact,
                            mobile: val.mobileContact !== "-" ? val.mobileContact : "",
                            email: val.email,
                            title: val.title,
                            department: val.department,
                            position: val.position,
                          });
                          setEditSmeUserModalVisible(true);
                        }}
                      />
                    ) : null}
                    {val.role !== "ADMIN" ? <DeleteOutlined className="text-base cursor-pointer" onClick={() => confirmToDelete(val.id, val.firstName + " " + val.lastName)} /> : null}
                  </div>
                </div>
              ))}
              {(subscriptionPlan === SUSBSCRIPTIONPLAN[0] && smeUsers.length < 2) || (subscriptionPlan === SUSBSCRIPTIONPLAN[1] && smeUsers.length < 4) || ((subscriptionPlan === SUSBSCRIPTIONPLAN[2] || subscriptionPlan === SUSBSCRIPTIONPLAN[3]) && smeUsers.length < 9) ? (
                <div className="flex gap-x-4 items-center py-4 border-b-4">
                  <div className="flex flex-col grow"></div>
                  <div className="grow-0 flex gap-x-4 ">
                    <PlusOutlined className="text-base cursor-pointer" onClick={() => setSmeUserModalVisible(true)} />
                  </div>
                </div>
              ) : null}
            </div> */}
          {/* </Col> */}
          <Col className="w-full 1150:w-12/12">
            {/* <Row className="flex justify-end items-center ">
              <div
                className="justify-center items-center gap-x-2 cursor-pointer font-semibold text-gray-400 text-lg underline underline-offset-2 decoration-dotted hidden 1150:block"
                onClick={() => {
                  sessionStorage.clear();
                  router.push("/ESG-sustainability-login");
                }}
              >
                <p>Logout</p>
              </div>
            </Row> */}
            {/* <Row className="flex mt-4 gap-x-4 justify-between verticalGap"> */}
              {/* <Col className="bg-white p-4 w-full 1150:w-37% flex shadow-md rounded-lg relative border-2">
                <div className="w-full">
                  <p className="font-semibold text-gray-400 text-sm 1000:text-base underline underline-offset-2 decoration-dotted absolute top-2 right-6 cursor-pointer" onClick={() => setEditCompanyProfileVisible(true)}>
                    Edit
                  </p>
                  <p className="font-bold text-sm 1000:text-base">Company Profile</p>
                  <div className="1000:flex 1000:flex-row mt-4 1000:justify-between">
                    <div>
                      <p className="font-semibold text-sm 1000:text-base">Business Registration Certificate:</p>
                      <p className="font-semibold text-sm 1000:text-base">{company.ssmDoc !== "" ? "Uploaded" : "Not Uploaded"}</p>
                    </div>
                    {company.approvedBy !== null ? (
                      <div className="w-1/4">
                        <p className="font-semibold text-smeBgColor text-sm 1000:text-base">Status:</p>
                        <p className="font-semibold text-smeBgColor text-sm 1000:text-base">Verified</p>
                      </div>
                    ) : (
                      <div className="w-1/4">
                        <p className="font-semibold text-red-500 text-sm 1000:text-base">Status:</p>
                        <p className="font-semibold text-red-500 text-sm 1000:text-base">Unverified</p>
                      </div>
                    )}
                  </div>
                  <p className="text-sm 1000:text-base font-semibold">
                    <span className="text-red-500">Note: </span> {company.ssmDoc !== "" ? company.approvedBy !== null ? <span>Your company has been verified</span> : <span>We will verify your account shortly</span> : <span>Please upload your business registration certificate</span>}
                  </p>
                </div>
                <div></div>
              </Col> */}
              {/* <Col className="bg-white p-4 w-full 1150:w-3/5 1150:flex shadow-md rounded-lg border-2"> */}
                {/* <Row className="1150:w-9/12 1150:flex">
                  <div className="w-full">
                    <div className="flex justify-between pr-10">
                      <p className="font-semibold text-sm 1000:text-base">My Current Assessment</p>
                    </div>
                    <p className="font-semibold text-xs">Assessment Progress</p>
                    <Progress percent={currentProgress} format={(percent) => <p className="text-black">{percent + "%"}</p>} />
                    {Object.keys(continueAssessment).length > 0 ? (
                      <p className="font-semibold text-sm 1000:text-base mt-2">
                        <span className="text-red-500">Note:</span> Your ESG Assessment Report can only be generated if your Company Profile status has been “Verified”.{" "}
                      </p>
                    ) : lastAssessment === "" ? (
                      <p className="font-semibold text-sm 1000:text-base mt-2">
                        <span className="text-red-500">Note:</span> Your ESG Assessment Report can only be generated if your Company Profile status has been “Verified”.{" "}
                      </p>
                    ) : (
                      <p className="font-semibold text-sm 1000:text-base mt-2">
                        <span className="text-red-500">Note:</span> You are allowed to complete the Assessment once every 6 months.{" "}
                      </p>
                    )}
                  </div>
                </Row> */}

                {/* <Row className="1150:flex 1150:w-1/4 justify-center p-4 items-center">
                  {Object.keys(continueAssessment).length > 0 ? (
                    <Button className="text-white flex justify-center items-center bg-#21324E w-full py-4 max-h-20 max-w-xs whitespace-pre-wrap	text-sm 1000:text-base font-semibold hover:bg-#21324E focus:bg-#21324E hover:text-white focus:text-white" onClick={() => router.push("/esg/assessment?id=" + company.id)}>
                      <p>
                        Continue
                        <br />
                        Assessment
                      </p>
                    </Button>
                  ) : lastAssessment === "" ? (
                    <Button className="text-white flex justify-center items-center bg-#21324E w-full py-4 max-h-20 whitespace-pre-wrap text-sm 1000:text-base font-semibold hover:bg-#21324E focus:bg-#21324E hover:text-white focus:text-white" onClick={() => router.push("/esg/assessment?id=" + company.id)}>
                      <p>
                        New
                        <br />
                        Assessment
                      </p>
                    </Button>
                  ) : (
                    <Button className="text-white flex justify-center items-center cursor-not-allowed bg-assessmentDraft w-full py-4 max-h-20 whitespace-pre-wrap	text-sm 1000:text-base font-semibold hover:bg-assessmentDraft focus:bg-assessmentDraft hover:text-white focus:text-white">
                      <p>
                        Next
                        <br />
                        Assessment
                      </p>
                    </Button>
                  )}
                  {Object.keys(continueAssessment).length === 0 && lastAssessment !== "" ? <p className="font-bold text-sm 1000:text-base">{lastAssessment}</p> : null}
                </Row> */}
              {/* </Col> */}
            {/* </Row> */}

            {/* <Row className="mt-8 rounded-lg">
              <p className="text-formTitleGreen font-bold text-sm 1000:text-base">{activeReportTable === "assestment" ? "List of my completed assessment reports" : activeReportTable === "connection" ? " List of companies that is currently connected" : activeReportTable === "singleBusiness" ? "List of shared assessment reports" : "List of portfolio reports"}</p>
              <Card
                style={{ width: "100%" }}
                tabList={reportTabList}
                activeTabKey={activeReportTable}
                className="dashboardCard rounded-xl mt-4 border-t-0 shadow-md"
                onTabChange={(key) => {
                  changeReportTab(key);
                }}
              >
                {showReportContentTab[activeReportTable]}
              </Card>
            </Row> */}
            <Row className="rounded-lg">
              <p className="text-formTitleGreen font-bold text-sm 1000:text-base" style={{color: 'purple'}}>Learning Resources</p>
              <Card
                style={{ width: "100%" }}
                tabList={[...learningTabList]}
                activeTabKey={activeLearningTable}
                className="dashboardCard rounded-xl mt-4 shadow-md"
                onTabChange={(key) => {
                  changeLearningTab(key);
                }}
              >
                <div className="">{learningTabList.length > 0 ? learningTabList.map((val) => showLearningTable(learningData[val.key], val.key)) : null}</div>
              </Card>
              {addSmeUser()}
              {editSmeUser()}
              {reportID !== "" ? shareReport() : null}
              {showUploadModal()}
              {showEditCompanyProfile()}
              {showDownload()}
              {showPending()}
              {connectionModal()}
            </Row>
          </Col>
        {/* </Row> */}
      </Content>
      <Footer />
    </Layout>
  );
}

export default HomePage;
