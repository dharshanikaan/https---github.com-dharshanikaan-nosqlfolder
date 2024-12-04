module.exports = (sequelize, DataTypes) => {
    const ForgotPasswordRequest = sequelize.define('ForgotPasswordRequest', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    });

    ForgotPasswordRequest.associate = (models) => {
        ForgotPasswordRequest.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return ForgotPasswordRequest;
};