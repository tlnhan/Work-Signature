import React from 'react'
import colors from '../../../colors'

function Footer() {
    return (
        <div>
            <div class="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 shadow" style={{ backgroundColor: colors.primary, boxShadow: '0px -3px 10px rgba(0, 0, 0, 0.2)' }}>
                <div class="text-white mb-3 mb-md-0">
                    Copyright © 2023 Work Management Viet Nam.
                </div>
            </div>
        </div>
    )
}

export default Footer