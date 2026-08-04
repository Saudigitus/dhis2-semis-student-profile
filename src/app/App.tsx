import React from 'react'
import { Router } from '../components/routes'
import { HashRouter } from 'react-router-dom'
import { AppWrapper } from 'dhis2-semis-components'
import { useConfig } from '@dhis2/app-runtime'
import { D2I18n } from 'dhis2-semis-types'
import translation from '../locales/index'

const App = ({ i18n }: { i18n: D2I18n }) => {
    const { baseUrl } = useConfig()
    const language = i18n == undefined ? translation : i18n

    return (
        <AppWrapper
            i18n={language}
            baseUrl={baseUrl}
            dataStoreKey="dataStore/semis/values"
            schoolCalendarKey='dataStore/semis/schoolCalendar'
        >
            <HashRouter>
                <Router i18n={language} />
            </HashRouter >
        </AppWrapper>
    )
}

export default App