import 'dotenv/config';
import path from 'path';
import pino from 'pino';
import { SlashasaurusClient } from 'slashasaurus';

const logger = pino();

const client = new SlashasaurusClient(
    {
        intents: [],
        restRequestTimeout: 30 * 1000
    },
    {
        logger
    }
);

client.once('ready', () => {
    client.logger.info(`Logged in: ${client.user?.tag}`);

    process.env.NODE_ENV === 'development'
        ? client.registerCommandsFrom(path.join(__dirname, '/commands'), true, process.env.DISCORD_TOKEN)
        : client.registerGuildCommandsFrom(
              path.join(__dirname, '/commands'),
              process.env.DISCORD_TEST_GUILD,
              true,
              process.env.DISCORD_TOKEN
          );
});

process.on('unhandledRejection', (err: Error) => {
    logger.error({ type: err.constructor.name, message: err.message, stack: err.stack.split('\n') });
});

process.on('uncaughtException', (err: Error) => {
    logger.error({ type: err.constructor.name, message: err.message, stack: err.stack.split('\n') });
});

client.login();
