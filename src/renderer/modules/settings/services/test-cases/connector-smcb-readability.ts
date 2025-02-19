/*
 * Copyright 2023 gematik GmbH
 *
 * The Authenticator App is licensed under the European Union Public Licence (EUPL); every use of the Authenticator App
 * Sourcecode must be in compliance with the EUPL.
 *
 * You will find more details about the EUPL here: https://joinup.ec.europa.eu/collection/eupl
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the EUPL is distributed on an "AS
 * IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the EUPL for the specific
 * language governing permissions and limitations under the License.ee the Licence for the specific language governing
 * permissions and limitations under the Licence.
 */

import { TestResult, TestStatus } from '@/renderer/modules/settings/services/test-runner';
import { launch as getCards } from '@/renderer/modules/connector/connector_impl/get-cards-launcher';
import { ConnectorError } from '@/renderer/errors/errors';
import { logger } from '@/renderer/service/logger';
import { ECardTypes } from '@/renderer/modules/connector/ECardTypes';
import i18n from '@/renderer/i18n';
import { ERROR_CODES } from '@/error-codes';

const translate = i18n.global.tc;

export async function connectorSmcbReadabilityTest(): Promise<TestResult> {
  try {
    const cardSmcbInfo = await getCards(ECardTypes.SMCB);
    return {
      name: translate('smcb_availability'),
      status: TestStatus.success,
      details: `SMC-B in Slot ${cardSmcbInfo.slotNr} vom CardTerminal ${cardSmcbInfo.ctId} gefunden!`,
    };
  } catch (err) {
    logger.debug(err.message);
    // @ts-ignore

    if (err.code === ERROR_CODES.AUTHCL_1105) {
      logger.debug('Multiple SMCBs found, no error');
      return {
        name: translate('smcb_availability'),
        status: TestStatus.success,
        details: translate('readability_test_Multi_SMCBs'),
      };
    }

    const details =
      err instanceof ConnectorError
        ? translate('error_info') + `${err.code}, ${err.description} `
        : translate('error_info') + `${err.message} `;
    return {
      name: translate('smcb_availability'),
      status: TestStatus.failure,
      details: details,
    };
  }
}
