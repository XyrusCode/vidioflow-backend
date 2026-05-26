declare const _default: () => {
    port: number;
    nodeEnv: string;
    jwtSecret: string;
    database: {
        url: string | undefined;
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    };
    paths: {
        video: string;
        audio: string;
        output: string;
    };
    ffmpeg: string;
};
export default _default;
