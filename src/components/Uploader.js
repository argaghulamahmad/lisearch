import {InboxOutlined} from '@ant-design/icons';
import {Upload, notification} from "antd";
import {usePapaParse} from 'react-papaparse';

const {Dragger} = Upload;

const Uploader = () => {
    const {readString} = usePapaParse();

    return <div>
        <Dragger {...{
            name: 'file',
            multiple: true,

            onDrop(e) {
                Array.from(e.dataTransfer.files).forEach(file => {
                    const reader = new FileReader();
                    reader.readAsText(file, "UTF-8");
                    if (file.name === "Connections.csv") {
                        reader.onload = function (evt) {
                            let result = evt.target.result;
                            switch (file.name) {
                                case "Connections.csv":
                                    readString(result, {
                                        worker: true,
                                        complete: (csv) => {
                                            let camelCaseKeys = csv.data[0].map((key) => {
                                                return key.replace(/\s(.)/g, function ($1) {
                                                    return $1.toUpperCase();
                                                })
                                                    .replace(/\s/g, '')
                                                    .replace(/^(.)/, function ($1) {
                                                        return $1.toLowerCase();
                                                    });
                                            });
                                            let connection = Object.assign({}, ...camelCaseKeys.map(key => ({[key]: ""})));
                                            const connections = []

                                            for (let i = 1; i < csv.data.length; i++) {
                                                const clone = {...connection};
                                                clone.firstName = csv.data[i][0]
                                                clone.lastName = csv.data[i][1]
                                                clone.emailAddress = csv.data[i][2]
                                                clone.company = csv.data[i][3]
                                                clone.position = csv.data[i][4]
                                                clone.connectedOn = csv.data[i][5]

                                                clone.fullName = csv.data[i][0] + ' ' + csv.data[i][1]

                                                connections.push(clone)
                                            }

                                            localStorage.setItem('connections', JSON.stringify(connections));
                                            notification.success({
                                                message: 'File Connections.csv valid',
                                                description: 'Connections record updated!',
                                            });
                                        },
                                    });
                                    break;
                                default:
                                    notification.error({
                                        message: 'Not a valid csv file',
                                    });
                            }
                        }
                        reader.onerror = function (evt) {
                            notification.error({
                                message: 'Not valid CSV file',
                            });
                        }
                    } else {
                        notification.error({
                            message: 'Please drop Connections CSV file',
                        });
                    }
                });
            },
        }}>
            <p className="ant-upload-drag-icon">
                <InboxOutlined/>
            </p>
            <p className="ant-upload-text">Drop Connections CSV file</p>
        </Dragger>
    </div>
};

export default Uploader;
