import { Layout, Row, Col, Table, Tooltip, Tag, Input, Spin, Modal } from "antd";
import Header from "./header";
// import SmeCorpLogo from "../../assests/logo/SmeCorp.png";
// import GlobalCompactLogo from "../../assests/logo/globalCompact.png";
import Footer from "../footer";
import { ConsoleSqlOutlined, DownloadOutlined, EyeOutlined, LoadingOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import APIHelpers from "../api/apiHelper";
import { ESGCalculation } from "../api/calculationHelper";
import { MSIC, PORTFOLIOREPORTURL, SUSBSCRIPTIONPLAN, WEBURL } from "../../compenents/config";
import { useRouter } from "next/router";
import { SearchFilter } from "../api/searchHelper";
import moment from "moment";

const { Content } = Layout;
const { Column } = Table;
const { Search } = Input;

function HomePage() {
  const router = useRouter();
  const [allCompanyData, setAllCompanyData] = useState([]);
  const [allLinkedCompanyData, setAllLinkedCompanyData] = useState({});
  const [isReady, setIsReady] = useState(0);
  const [assessment, setAssessment] = useState([]);
  const [fullAssessment, setFullAssessment] = useState([]);
  const [isDownload, setIsDownload] = useState(false);
  const [corporateCompany, setCorporateCompany] = useState([]);

  useEffect(() => {
    setIsReady(isReady + 1);
  }, []);

  useEffect(() => {
    if (isReady === 1) {
      getAllSMECompany();
    }
  }, [isReady]);

  useEffect(() => {
    if (allCompanyData.length > 0) {
      getAllSubscriptions();
    }
  }, [allCompanyData]);

  useEffect(() => {
    if (corporateCompany.length > 0) {
      getAllConnection();
    }
  }, [corporateCompany]);

  useEffect(() => {
    if (allCompanyData.length > 0 && Object.keys(allLinkedCompanyData).length > 0) {
      getAllAssessment();
    }
  }, [allLinkedCompanyData, allCompanyData]);

  const getAllSMECompany = () => {
    APIHelpers.GET("v1/smes")
      .then((res) => {
        if (res.items !== null) {
          setAllCompanyData(res.items);
          // let corporate = []
          // res.items.map((val, index) => {
          //   if(val.linkedWiths !== null) {
          //     val.linkedWiths.map((share, shareIndex) => {
          //       if(share.status === "ACTIVE") {
          //         if(!(share.corporateID in item)) {
          //           item[share.corporateID] = []
          //         }
          //         item[share.corporateID].push(val.id)
          //       }
          //       if(index === (res.items.length - 1) && shareIndex === (val.linkedWiths.length - 1)) {
          //         setAllCompanyData(res.items)
          //         setAllSMECompanyData(item);
          //       }
          //     })
          //   }
          // });
        }
      })
      .catch(() => {});
  };

  const getAllSubscriptions = () => {
    APIHelpers.GET("v1/subscriptions")
      .then((res) => {
        if (res.items) {
          res.items = res.items.sort((a, b) => moment(b.createdAt).unix() - moment(a.createdAt).unix());
          let corporate = [];
          res.items.map((val, index) => {
            if (!corporate.includes(val.corporateID)) {
              if (val.subscriptionPlan !== SUSBSCRIPTIONPLAN[0]) {
                corporate.push(val.corporateID);
              }
            }
            if (index === res.items.length - 1) {
              setCorporateCompany(corporate);
            }
          });
        }
      })
      .catch(() => {});
  };

  const getAllConnection = () => {
    APIHelpers.GET("v1/connections")
      .then((res) => {
        if (res.items) {
          let link = new Object();
          corporateCompany.map((val, index) => {
            let conn = res.items.filter((item) => (item.requestCompanyID === val || item.receivedCompanyID === val) && item.status === "ACTIVE");
            if (conn.length > 0) {
              link[val] = [];
              conn.map((value) => {
                if (value.requestCompanyID !== val) {
                  link[val].push(value.requestCompanyID);
                } else if (value.receivedCompanyID !== val) {
                  link[val].push(value.receivedCompanyID);
                }
              });
            }
            if (index === corporateCompany.length - 1) {
              setAllLinkedCompanyData(link);
            }
          });
        }
      })
      .catch(() => {});
  };

  const getAllAssessment = () => {
    APIHelpers.GET("v1/assessments")
      .then((res) => {
        if (res.items !== null) {
          let corporatePortfolio = new Object();
          res.items = res.items.sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate));
          let complete = res.items.filter((item) => item.completionDate !== "0001-01-01T00:00:00Z" && item.sharedWiths !== null);
          complete.map((val, index) => {
            APIHelpers.GET("v1/assessmentEntries?assessmentId=" + val.id)
              .then((res) => {
                ESGCalculation(res.items)
                  .then((res) => {
                    val.sharedWiths.map((corporate) => {
                      if (corporateCompany.includes(corporate.corporateID)) {
                        if (corporate.status === "ACTIVE" && allLinkedCompanyData[corporate.corporateID].includes(val.smeID)) {
                          if (!(corporate.corporateID in corporatePortfolio)) {
                            corporatePortfolio[corporate.corporateID] = {
                              id: corporate.corporateID,
                              companyName: allCompanyData.filter((item) => item.id === corporate.corporateID)[0].companyName,
                              Env: 0,
                              Soc: 0,
                              Gov: 0,
                              Sus: 0,
                              score: 0,
                              length: 0,
                            };
                          }
                          // corporatePortfolio[corporate.corporateID].Env += Math.round(res.Environment);
                          corporatePortfolio[corporate.corporateID].Env += Math.round(res.Environmental);
                          corporatePortfolio[corporate.corporateID].Soc += Math.round(res.Social);
                          corporatePortfolio[corporate.corporateID].Gov += Math.round(res.Governance);
                          corporatePortfolio[corporate.corporateID].Sus += Math.round(res["Sustainable Procurement"]);
                          corporatePortfolio[corporate.corporateID].score += Math.round(res.overall);
                          corporatePortfolio[corporate.corporateID].length += 1;
                        }
                      }
                    });
                  })
                  .catch(() => {});
              })
              .catch(() => {});
            if (index === complete.length - 1) {
              setTimeout(() => {
                let data = [];
                Object.keys(corporatePortfolio).map((val, index) => {
                  data.push({
                    id: corporatePortfolio[val].id,
                    companyName: corporatePortfolio[val].companyName,
                    Env: Math.round(corporatePortfolio[val].Env / corporatePortfolio[val].length),
                    Soc: Math.round(corporatePortfolio[val].Soc / corporatePortfolio[val].length),
                    Gov: Math.round(corporatePortfolio[val].Gov / corporatePortfolio[val].length),
                    Sus: Math.round(corporatePortfolio[val].Sus / corporatePortfolio[val].length),
                    score: Math.round(corporatePortfolio[val].score / corporatePortfolio[val].length),
                  });
                  if (index === Object.keys(corporatePortfolio).length - 1) {
                    setAssessment(data);
                    setFullAssessment(data);
                  }
                });
              }, 1000);
            }
          });
        }
      })
      .catch(() => {});
  };

  const showDownload = () => {
    return (
      <Modal visible={isDownload} className="" footer={null} closable={false} width={600}>
        <div className="flex justify-center items-center gap-x-4">
          <Spin indicator={<LoadingOutlined spin />} />
          <p className="font-semibold text-xl">Please wait for your report to be downloaded.</p>
        </div>
      </Modal>
    );
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

  return (
    <Layout className="min-h-full">
      <Header></Header>
      <Content className="bg-white px-8 1000:px-12 min-h-9/10 w-full pb-8">
        {/* <Row className="flex mt-4">
          <div className="px-2 cursor-default w-49% 700:w-auto">
            <img src={GlobalCompactLogo.src} width={250} className="h-16 700:h-full"></img>
          </div>
          <div className="px-2 cursor-default w-49% 700:w-auto">
            <img src={SmeCorpLogo.src} className="h-16 700:h-full"></img>
          </div>
        </Row> */}
        <Row className="flex justify-end items-center mt-8">
          <div
            className="flex justify-center items-center gap-x-2 cursor-pointer font-semibold text-gray-400 text-lg underline underline-offset-2 decoration-dotted"
            onClick={() => {
              sessionStorage.clear();
              router.push("/");
            }}
          >
            <p>Logout</p>
          </div>
        </Row>
        <Row className="mt-8 min-h-8/10 gap-x-8">
          <Col className="w-full">
            <div className="flex 1000:flex-row flex-col 1000:flex 1000:justify-between mt-2 overflow-auto verticalGap">
              <p className="text-2xl font-semibold">Portfolio Report Dashboard</p>
              <Search
                className="self-end flex w-auto"
                maxLength={20}
                onSearch={(value) => {
                  setAssessment([]);
                  SearchFilter(fullAssessment, value)
                    .then((res) => {
                      setAssessment(res);
                    })
                    .catch(() => {
                      setAssessment(fullAssessment);
                    });
                }}
              />
            </div>
            <Table
              className="titleRow mt-4 border-2"
              dataSource={[...assessment]}
              pagination={{
                showSizeChanger: true,
                position: ["bottomLeft"],
                pageSize: 20,
              }}
              scroll={{ x: 800 }}
            >
              <Column title="Company Name" dataIndex="companyName" width={150} sorter={(a, b) => a.companyName.localeCompare(b.companyName)} showSorterTooltip={false}></Column>
              <Column
                title="Environmental"
                sorter={(a, b) => a.Env - b.Env}
                showSorterTooltip={false}
                width={150}
                render={(row) => {
                  return (
                    <div className="flex items-center">
                      {row.Env + "%"}&emsp;
                      {getESGLevel(row.Env)}
                    </div>
                  );
                }}
              ></Column>
              <Column
                title="Social"
                sorter={(a, b) => a.Soc - b.Soc}
                showSorterTooltip={false}
                width={150}
                render={(row) => {
                  return (
                    <div>
                      {row.Soc + "%"}&emsp;
                      {getESGLevel(row.Soc)}
                    </div>
                  );
                }}
              ></Column>
              <Column
                title="Governance"
                sorter={(a, b) => a.Gov - b.Gov}
                showSorterTooltip={false}
                width={150}
                render={(row) => {
                  return (
                    <div>
                      {row.Gov + "%"}&emsp;
                      {getESGLevel(row.Gov)}
                    </div>
                  );
                }}
              ></Column>
              <Column
                title="Sustainable Procurement"
                sorter={(a, b) => a.Sus - b.Sus}
                showSorterTooltip={false}
                width={150}
                render={(row) => {
                  return (
                    <div>
                      {row.Sus + "%"}&emsp;
                      {getESGLevel(row.Sus)}
                    </div>
                  );
                }}
              ></Column>
              <Column
                title="ESG Portfolio Maturity Level"
                sorter={(a, b) => a.score - b.score}
                showSorterTooltip={false}
                width={150}
                render={(row) => {
                  return (
                    <div>
                      {row.score + "%"}&emsp;
                      {getESGLevel(row.score)}
                    </div>
                  );
                }}
              ></Column>
              <Column
                title=""
                width={150}
                render={(row) => {
                  return (
                    <div className="flex gap-x-4 items-center text-xl">
                      <Tooltip title="View">
                        <EyeOutlined
                          className="text-view cursor-pointer"
                          onClick={() => {
                            let link = document.createElement("a");
                            link.target = "_blank";
                            link.href = WEBURL + "/esg/portfolioReport?id=" + row.id + "&token=" + sessionStorage.getItem("accessToken");
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="Download">
                        <DownloadOutlined
                          className="text-share cursor-pointer"
                          onClick={() => {
                            setIsDownload(true);
                            let data = PORTFOLIOREPORTURL + "/esg?target=" + WEBURL + "/esg/portfolioPdf?id=" + row.id + "&accessToken=" + sessionStorage.getItem("accessToken");
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
                    </div>
                  );
                }}
              ></Column>
            </Table>
          </Col>
        </Row>
        {showDownload()}
      </Content>
      <Footer />
    </Layout>
  );
}

export default HomePage;
